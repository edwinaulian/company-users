require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const userModel = require('./models/users');
const app = express();

app.use(cors());
app.use(bodyparser.json());

// connect database
mongoose.connect(process.env.mongodburl, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('db connection failed...', err);
    }
    else {
        console.log('db connection success...');
    }
});

// 1.save or create data 
app.post('/', async (req, res) => {
    const chkdataexit = await userModel.findOne({ $or: [{ uemail: req.body.email }, { umobile: req.body.mobile }] });
    if (chkdataexit) {
        if (chkdataexit.uemail === req.body.email) {
            res.send({
                msg: "email id already exits"
            });
        }
        else {
            res.send({
                msg: "mobile number already exits"
            });
        }
    }
    else {
        // save to db 
        const data = new userModel(
            {
                uname: req.body.uname,
                uemail: req.body.uemail,
                umobile: req.body.umobile
            }
        );

        data.save((err, result) => {
            if (err) {
                console.log('create db failed', err);
            }
            else {
                res.send({
                    msg: 'data created',
                    data: result
                });
            }
        });
    }
});

// 2. get all data 
app.get('/', async (req, res) => {
    const data = await userModel.find();
    if (data) {
        res.send({
            msg: "all user data",
            result: data
        });
    } else {
        res.send({
            msg: "No data"
        });
    }
});

// 3.get data by id 
app.get('/:id', async (req, res) => {
    console.log(req.params.id, 'ids');
    if (req.params.id) {
        const chkid = mongoose.isValidObjectId(req.params.id);
        if (chkid === true) {
            const iddata = await userModel.findById({ _id: req.params.id });
            if (iddata == null) {
                res.send({
                    msg: 'single data not data',
                    result: iddata
                })
            }
            else {
                res.send({
                    msg: "single data ",
                    result: iddata
                });
            }
        }
        else {
            res.send({
                msg: "invalid user id"
            })
        }
    }
});

//4.delete single data
app.delete('/:id', async (req, res) => {
    const chkvalidid = mongoose.isValidObjectId(req.params.id);
    if (chkvalidid == true) {
        const iddata = await userModel.remove({ _id: req.params.id });
        if (iddata == null) {
            res.send({
                msg: "data not found"
            });
        }
        else {
            res.send({
                msg: "data remove"
            });
        }
    } else {
        res.send({
            msg: "invalid id please enter valid id"
        });
    }
});

// 5.update single data
app.put('/:id', async (req, res) => {
    const updatedata = await userModel.updateOne({ _id: req.params.id }, { $set: { uemail: req.body.uemail } });
    if (updatedata) {
        res.send({
            msg: "data updated"
        });
    }
});

// run server 
const PORT = process.env.PORT | 3004;
app.listen(PORT, () => {
    console.log(`server running ... ${PORT}`);
});