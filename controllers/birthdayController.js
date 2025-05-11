const Birthday = require('../models/Birthday');

// Get all birthdays
const getBirthdays = async (req, res) => {
    try {
        const birthdays = await Birthday.find({ user: req.user._id }).sort({ date: 1 });
        res.json(birthdays);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch birthdays' });
    }
};

// Add a birthday
const addBirthday = async (req, res) => {
    const { name, date } = req.body;
    
    if (!name || !date) {
        return res.status(400).json({ message: 'Name and date are required.' });
    }
    try {
        const newBirthday = new Birthday({ name, date, user: req.user._id });
        await newBirthday.save();
        res.status(201).json(newBirthday);
    } catch (error) {
        console.error('Error adding birthday:', error);
        res.status(500).json({ message: 'Failed to add birthday' });
    }
};

// Update a birthday
const updateBirthday = async (req, res) => {
    try {
        const { _id } = req.params;
        const birthday = await Birthday.findOne({ _id, user: req.user._id });

        if(!birthday) {
            return res.status(404).json({ message: 'Birthday not found or not authorised' });
        }

        birthday.name = req.body.name || birthday.name;
        birthday.date = req.body.date || birthday.date;

        const updatedBirthday = await birthday.save();
        res.json(updatedBirthday);
    } catch (error) {
        console.error('Error updating birthday:', error);
        res.status(500).json({ message: 'Failed to update birthday' });
    }
};

// Delete a birthday
const deleteBirthday = async (req, res) => {
    try{
        const { _id } = req.params;
        const birthday = await Birthday.findOneAndDelete({ _id, user: req.user._id });

        if (!birthday) {
            return res.status(404).json({ message: 'Birthday not found or not authorised' });
        }

        res.json({ message: 'Birthday deleted successfuly' });        
    } catch (error) {
        console.error('Error deleting birthday:', error);
        res.status(400).json({ message: 'Failed to delete birthday' });
    }
};

module.exports = {
    getBirthdays,
    addBirthday,
    updateBirthday,
    deleteBirthday
};