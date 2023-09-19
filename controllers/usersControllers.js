const User = require('../models/user')
const Note = require('../models/note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// @dec get all users
// @route Get /users
// @access Private
const getAllUsers = asyncHandler( async (req,res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message :'No users found'})
    }
  console.log(users)
        res.json(users)
    

})

// @dec create a new users
// @route POST /users
// @access Private
const createNewUSer = asyncHandler( async (req,res) => {
    const {username,password, roles} = req.body

    //confirming data
    if(!username || !password ){
        return res.status(400).json({message:'All fields are required'})
    }

    //check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if(duplicate){
        return res.status(409).json({message:'duplicate username'})
    }
    // hash password
    const hashedPwd = await bcrypt.hash(password,10) // salt

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // create and store new uers

    const user= await User.create(userObject)

    if(user){//created
        res.status(201).json({message:`New user ${username} created`})
    }
    else{
        res.status(400).json({message:'Invalide user data received'})
    }



})


// @dec update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler( async (req,res) => {
    const{ id, username,roles,active, password} = req.body
    // confirm data
console.log(req.body)
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        res.status(400).json({message:'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:'User not found'})
    }

    //check for duplicate

    const duplicate = await User.findOne({username}).lean().exec()

    //allow updates to the original user

    if(duplicate && duplicate?._id.toString() !== id ){
        return res.status(409).json({message: 'Duplicate username'})
    }
    user.username = username

    user.roles = roles
    user.active = active

    if(password){
        // hashing password

        user.password = await bcrypt.hash(password,10)//

    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated`})

})


// @dec delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler( async (req,res) => {
    const {id} = req.body
    if(!id){
        return res.status(400).json({message:'User ID Required'})
    }

    const note = await Note.findOne({user:id}).lean().exec()

    if(note?.length){
        return res.status(400).json({message:'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:'User not found'})
    }

    const result =  await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)

})


module.exports = {
    getAllUsers,
    createNewUSer,
    updateUser,
    deleteUser
}