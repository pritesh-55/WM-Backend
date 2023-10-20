const Clients = require("../database/client_model")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

async function register(req,res){    
    try{
        const {name,email,password,confirmpassword} = req.body
        const check = await Clients.findOne({email})

        if(!check){
            if(password === confirmpassword){
                const user = new Clients({
                    name :name, 
                    email : email,                
                    password : password,
                    confirmpassword : confirmpassword
                })

                const token = await user.generatetoken()  //Creating Web Token for authentication


                // Store JWT tokens in HTTP only Cookie in browser
                res.cookie('webtoken', token, {
                    expires: new Date(Date.now()+36000000),
                    httpOnly:true
                })
    
                await user.save()
                res.status(201).json(user)
            }
            else res.status(404).json({"response":"Password does not matched"})
        }
        else res.status(404).json({"response":"Email-ID already exist, Please Login"})   
    }
    catch(err){
        res.status(500).json({"response":`Cannot Register due to ${err}`})
    }   
}

async function login(req,res){    
    try{
        const {email,password} = req.body

        const user = await Clients.findOne({email})

        if(user){
            const isMatch = await bcrypt.compare(password,user.password)

                if(isMatch){
                    const token = await user.generatetoken()

                    res.cookie('webtoken', token, {
                        expires: new Date(Date.now()+300000),
                        httpOnly:true
                    })

                    res.status(200).json(user)
                } 
                else res.status(404).json({"response":"Invalid Password"})
        }

        else res.status(404).json({"response":"Invalid Email-ID"})
    }
    catch(err){
        res.status(500).json({"response":`Cannot Login due to ${err}`})
    }   
}

async function addtocart (req,res){
    
    const email = req.params.email;
    const newServiceData = req.body    
    try {
        const user = await Clients.findOne({ email });

        if(user){
            // Check if the user already has the service data
            const existingService = user.services.find(service => 
                service.service_title === newServiceData.service_title
            );

            if (existingService) {
                existingService.service_desc = newServiceData.service_desc;
                existingService.price = newServiceData.price;
                existingService.isfixed = newServiceData.isfixed;
                existingService.ispaid = newServiceData.ispaid;
            } 
            else user.services.push(newServiceData) 

            await user.save();
            res.status(201).json({ message: 'Service data updated or added.' });
        } 
        else res.status(404).json({ message: 'User not found.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function removefromcart (req,res){
    
    const email = req.params.email;
    try {
        const user = await Clients.findOne({ email });

        if(user){
            // Check if the user already has the service data
            const existingService = user.services.find(service => 
                service.service_title === req.body.service_title
            );
           console.log(existingService)
            if (existingService) {
                user.services.pop(existingService)
                await user.save();
                res.status(201).json({ message: 'Service data deleted.' });
            } 
            else res.status(404).json({ message: 'Service data does not exist.' });     
        } 
        else res.status(404).json({ message: 'User not found.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function unpaidservices (req,res){
    const email = req.params.email;
    try {
        const user = await Clients.findOne({ email });

        if(user){
           const unpaidServices = user.services.filter(service => !service.ispaid);
           console.log(unpaidServices)
           res.status(200).json(unpaidServices);     
        } 
        else res.status(404).json({ message: 'User not found.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function paidservices (req,res){
    const email = req.params.email;
    try {
        const user = await Clients.findOne({ email });

        if(user){
           const paidServices = user.services.filter(service => service.ispaid);
           console.log(paidServices)
           res.status(200).json(paidServices);     
        } 
        else res.status(404).json({ message: 'User not found.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}





module.exports = {register, login, addtocart, removefromcart, unpaidservices, paidservices}