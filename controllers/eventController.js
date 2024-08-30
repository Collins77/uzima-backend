const Event = require('../model/Event');

const createEvent = async (req, res) => {
    try {
        const { name, description, link, date, startTime, endTime } = req.body;

        // Convert startTime and endTime to Date objects
        const startTimeDate = new Date(`${date.split('T')[0]}T${startTime}`);
        const endTimeDate = new Date(`${date.split('T')[0]}T${endTime}`);

        // Create a new event instance
        const event = new Event({
            name,
            description,
            link,
            date,
            startTime: startTimeDate,
            endTime: endTimeDate
        });

        // Save the event to the database
        await event.save();

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

const editEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, link, date, startTime, endTime } = req.body;

        // Find the event by ID and update it
        const event = await Event.findByIdAndUpdate(
            id,
            { name, description, link, date, startTime, endTime },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the event by ID and delete it
        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};
const getEventbyId = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });

        }
        res.status(200).json(event);
        // return plan;
    } catch (error) {
        console.error('Error getting event:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


const getEvents = async (req, res) => {
    try {
        const events = await Event.find(); // Fetch all events from the database
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
}

module.exports = { createEvent, editEvent, deleteEvent, getEvents, getEventbyId };
