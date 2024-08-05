const Plan = require('../model/Plan');

const createPlan = async (req, res) => {
  const { name, description, price } = req.body;

  // Basic validation
  if (!name || !description || !price) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const newPlan = new Plan({ name, description, price });
    await newPlan.save();
    res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating plan:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const editPlan = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { name, description, price },
      { new: true, runValidators: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPlan, editPlan, deletePlan };
