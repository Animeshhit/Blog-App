import mongoose from "mongoose";
import {
    slugifyWithCounter
} from '@sindresorhus/slugify';
import createDOMPurify from 'dompurify';
import {
    JSDOM
} from 'jsdom';
import {
    marked
} from 'marked';


const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const slugify = slugifyWithCounter();

const NotesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    author: String,
    desc: {
        type: String,
        required: true
    },
    html: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
        }
    })

    const userSchema = new mongoose.Schema({
        name: String,
        password: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
        default: Date.now()
        }
    })

    NotesSchema.pre('validate', function (next) {
        console.log(this.content);
        this.slug = slugify(this.title, {
            lower: true
        });
        this.html = DOMPurify.sanitize(marked(this.content));
        next();
    })


    const Notes = mongoose.model('note', NotesSchema);
    const User = mongoose.model('user', userSchema);



    export default Notes;
    export {
        User
    };