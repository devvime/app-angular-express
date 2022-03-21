const express = require('express')
const router = express.Router()
const multer = require('multer')
const Post = require('../models/post')
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype]
        let error = new Error('Invalid mime type')
        if (isValid) {
            error = null
        }
        cb(null, 'backend/uploads')
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-')
        const ext = MIME_TYPE_MAP[file.mimetype]
        cb(null, name + '-' + Date.now() + '.' + ext)
    }
})

router.get('', (req, res) => {
    const pageSize = +req.query.pagesize
    const currentPage = +req.query.page
    const postQuery = Post.find()
    let fechedPosts
    if (pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize)
    }
    postQuery.then(data => {
        fechedPosts = data
        return Post.count()
    }).then(count => {
        res.json({
            message: 'Poss fetched successfully',
            posts: fechedPosts,
            maxPosts: count
        })
    })
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.json(post)
        } else {
            res.json({ message: "Post not found!" })
        }
    }).catch(error => {
        console.log(error)
    })
})

router.post('', multer({ storage: storage }).single('image'), (req, res) => {
    const url = req.protocol + '://' + req.get('host')
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/uploads/' + req.file.filename
    })
    post.save().then(createdPost => {
        res.json({
            message: "Post added successfully!",
            post: {
                ...createdPost,
                id: createdPost._id
            }
        })
    }).catch(error => {
        console.log(error)
    })
})

router.put('/:id', multer({ storage: storage }).single('image'), (req, res) => {
    let imagePath = req.body.imagePath
    if (req.file) {
        const url = req.protocol + '://' + req.get('host')
        imagePath = url + '/uploads/' + req.file.filename
    }
    const post = new Post({
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath
    })
    Post.updateOne({ _id: req.params.id }, post).then(result => {
        res.json({ message: "Update successful!" })
    }).catch(error => {
        console.log(error)
    })
})

router.delete('/:id', (req, res) => {
    Post.deleteOne({ _id: req.params.id }).then(result => {
        res.json({ message: "Post deleted!", id: req.params.id })
    }).catch(error => {
        console.log(error)
    })
})

module.exports = router