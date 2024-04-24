const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const User = require('./user');
const Product = require('./product');
const Cart = require('./cart');
const protect = require('./protect');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(fileUpload());
app.use('/protect', protect);

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    const username = req.cookies.username;
    const admin = process.env.ADMIN_USERNAME;
    const adminpassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    jwt.verify(token, secret, (err, decoded) => {
        return !token || err || decoded.username !== username || decoded.password !== adminpassword || decoded.secret !== secret || username !== admin
            ? res.redirect('/protect')
            : (req.username = decoded.username, next());
    });
};

app.get('/user', verifyToken, async (req, res) => {
    try {
        const allusers = await User.findAll();
        res.json(allusers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/product', async (req, res) => {
    try {
        const allProducts = await Product.findAll({
            attributes: ['id', 'name', 'price', 'des', 'img']
        });

        const allproduct = allProducts.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            des: product.des,
            img: `data:image/webp;base64,${Buffer.from(product.img, 'binary').toString('base64')}`
        }));

        res.json(allproduct);
    } catch (error) {
        res.status(500).json({ error: 'Error for product' });
    }
});

app.post('/addproduct', async (req, res) => {
    const { name, price, des } = req.body;

    try {
        if (!req.files || !req.files.img) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const img = req.files.img;

        await Product.create({
            name: name,
            price: price,
            des: des,
            img: img.data
        });

        return res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data into MySQL:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
});

app.post('/deleteproduct', async (req, res) => {
    const { id } = req.body;
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        await product.destroy();

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Error delete data' });
    }
});

app.post('/editproduct', async (req, res) => {
    const { id, name, price, des } = req.body;
    const img = req.files ? req.files.img : null;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        let updateFields = { name, price, des };

        if (img) {
            updateFields.img = img.data;
        }

        await product.update(updateFields);

        return res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error update data' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = process.env.ADMIN_USERNAME;
    const adminpassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user || password !== user.password) {
            return res.status(400).json({ error: 'Invalid username/password' });
        }

        let token;
        if (user.username === admin && user.password === adminpassword && user.id === 1) {
            token = jwt.sign({ id: user.id, username: user.username, password: user.password, secret: secret }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
        } else {
            token = jwt.sign({ id: user.id, username: user.username, password: user.password }, process.env.JWT_SECRET, { expiresIn: '1h', });
        }

        res.status(200).json({ message: 'Login Successfully', token, username: user.username, id: user.id });
    } catch (error) {
        res.status(500).json({ error: "Error to login" });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existing = await User.findOne({ where: { username } });

        if (existing) {
            return res.status(400).json({ error: 'Username is already in use. Please choose another username.' });
        }

        await User.create({ username, email, password });

        return res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error to register' });
    }
});

Cart.belongsTo(Product, { foreignKey: 'productid' });
Cart.belongsTo(User, { foreignKey: 'userid' });

app.get('/cart/:username/:id/:token', async (req, res) => {
    const username = req.params.username;
    const token = req.params.token;
    const userid = req.params.id;

    try {
        const existingUser = await User.findOne({ where: { username } });

        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid username/id/token' });
        }

        const decodedToken = jwt.decode(token);
        if (!decodedToken || decodedToken.username !== username || decodedToken.password !== existingUser.password || decodedToken.id !== existingUser.id || decodedToken.id !== parseInt(userid)) {
            return res.status(400).json({ error: "Invalid username/password or user ID" });
        }

        const cartItems = await Cart.findAll({
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'des', 'img']
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'password']
                }
            ]
        });

        const allCart = cartItems
            .filter(cartItem => cartItem.user.username === username)
            .map(cartItem => ({
                productid: cartItem.product.id,
                productname: cartItem.product.name,
                productprice: cartItem.product.price,
                productdes: cartItem.product.des,
                productimg: `data:image/webp;base64,${Buffer.from(cartItem.product.img, 'binary').toString('base64')}`,
                quantity: cartItem.quantity
            }));

        res.json({ allCart });

    } catch (error) {
        console.error('Error fetching carts:', error);
        res.status(500).json({ error: 'Error fetching carts' });
    }
});

app.post('/addtocart', async (req, res) => {
    const { productid, productname, userid } = req.body;
    let quantity = 1;

    try {
        const existing = await Cart.findOne({ where: { productid, userid } });

        if (existing) {
            return res.status(200).json({ message: `Product ${productname} already added to cart` });
        }

        await Cart.create({ productid, userid, quantity });

        return res.status(200).json({ message: `Product ${productname} added to cart` });
    } catch (error) {
        console.error('Error adding to cart:', error);
        return res.status(500).json({ error: 'Error adding to cart' });
    }
});

app.post('/removefromcart', async (req, res) => {
    const { productid, userid } = req.body;

    try {
        const cartItem = await Cart.findOne({ where: { productid, userid } });

        if (!cartItem) {
            return res.status(200).json({ message: 'Product not found in cart' });
        }

        await cartItem.destroy();

        return res.status(200).json({ message: `Product ${productid} removed from cart` });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return res.status(500).json({ error: 'Error removing from cart' });
    }
});

app.post('/cartaddquantity', async (req, res) => {
    const { productid, userid } = req.body;

    try {
        const cartitem = await Cart.findOne({ where: { productid, userid } });

        if (!cartitem) {
            return res.status(200).json({ message: 'Product not found in cart' });
        }

        cartitem.quantity += 1;
        await cartitem.save();

        return res.status(200).json({ message: 'Quantity increased by 1' });
    } catch (error) {
        console.error('Error increasing quantity:', error);
        return res.status(500).json({ error: 'Error increasing quantity' });
    }
});

app.post('/cartdecresequantity', async (req, res) => {
    const { productid, userid } = req.body;

    try {
        const cartitem = await Cart.findOne({ where: { productid, userid } });

        if (!cartitem) {
            return res.status(200).json({ message: 'Product not found in cart' });
        }

        if (cartitem.quantity === 1 || cartitem.quantity < 1) {
            return res.status(200).json({ message: 'Quantity cannot less than 1' });
        }

        cartitem.quantity -= 1;
        await cartitem.save();

        return res.status(200).json({ message: 'Quantity decreased by 1' });
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        return res.status(500).json({ error: 'Error decreasing quantity' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
