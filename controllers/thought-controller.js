const { User, Thought, Reaction } = require('../models');
const { db } = require('../models/User');
// GET all posts
const thoughtController = {
   getAllThoughts(req, res) {
    try {
        const thoughtData = Thought.find({})
        .populate({ path: 'reactions', select: '-__v' })
        .select('-__v')

        res.status(200).json(thoughtData)
    } catch (err) {
        res.status(500).json(err)
    }
   },

   // GET route by ID
   getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
    .populate({ path: 'reactions', select: '-__v' })
    .select('-__v')
    .then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No Post found' });
            return;
        }
        res.status(200).json(dbThoughtData);
    })
    .catch(err => {
        console.log(err);
        res.status(400).json(err);
    });
   },

   // POST route
   createThought({ body }, res) {
    Thought.create(body)
    .then(dbThoughtData => {
        User.findOneAndUpdate(
            { _id: body.userId},
            { $push: { Thoughts: dbThoughtData._id } },
            { new: true }
        )
        .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({ message: 'No User found' });
                return;
            }
            res.status(200).json(dbUserData);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.status(400).json(err));
   },

   updateThought({ params, body }, res) {
    Thought.findOneAndUpdate(
        { _id: params.id},
        body,
        { new: true }
    )
    .then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No thought found with this id' });
            return;
        }
        res.status(200).json(dbThoughtData);
    })
    .catch(err => res.status(500).json(err));
   },

   // DELETE route
   deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
    .then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No Post found' });
            return;
        }
        User.findOneAndUpdate(
            { username: dbThoughtData.username },
            { $pull: { Thoughts: params.id } }
        )
        .then(() => {
            res.json({message: 'Deleted' });
        })
        .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(500).json(err));
   },

   //POST comments
   addReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
        { _id: params.ThoughtId },
        { $addToSet: { reactions: body } },
        {new: true, runValidators: true}
    )
    .then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No Post Found '});
            return;
        }
        res.status(200).json(dbThoughtData);
    })
    .catch(err => res.status(500).json(err));
   },
   
   //DELETE comments
   deleteReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
        { _id: params.ThoughtId },
        { $pull: { reactions: { reactionId: body.reactionId } } },
        { new: true, runValidators: true }
    )
    .then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No Post Found' });
            return;
        }
        res.status(200).json({ message: 'DELETED' });
    })
    .catch(err => res.status(500).json(err));
   },
}

module.exports = thoughtController;
