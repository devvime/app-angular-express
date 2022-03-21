import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Router } from "@angular/router";

import { Post } from "./post.model";

@Injectable({providedIn: 'root'})

export class PostsService {

    private posts: Post[] = []
    private postsUpdated = new Subject<{posts: Post[], maxPosts: number}>()

    constructor(private http: HttpClient, private router: Router) {}

    getPost(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`
        this.posts = []
        this.http.get<{message: string, posts: any, maxPosts: number}>('http://localhost:3000/api/posts' + queryParams).subscribe((postData)=>{
            postData.posts.forEach((post: any)=>{
                this.posts.push({
                    id: post._id,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath
                })
            })
            this.postsUpdated.next({posts: [...this.posts], maxPosts: postData.maxPosts})
        })
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable()
    }

    findPost(id: any) {
        return this.http.get<{_id: string, title: string, content: string, imagePath: string}>('http://localhost:3000/api/posts/'+id)
    }

    addPost(id: any, title: string, content: string, image: File) {
        const postData = new FormData()
        postData.append('title', title)
        postData.append('content', content)
        postData.append('image', image)

        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData).subscribe((responseData)=>{
            console.log(responseData.message)
            const post = {
                id: responseData.post.id,
                title: title, 
                content: content,
                imagePath: responseData.post.imagePath
            }
            this.posts.push(post)
            this.postsUpdated.next({posts: [...this.posts], maxPosts: 0})
            this.router.navigate(['/'])
        })        
    }

    updatePost(id: any, title: string, content: string, image: File | string) {
        let postData: any
        if(typeof(image) === 'object') {
            postData = new FormData()
            postData.append('title', title)
            postData.append('content', content)
            postData.append('image', image, title)
        }else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image
            } 
        }
        this.http.put<{message: string, imagePath: string}>('http://localhost:3000/api/posts/'+id, postData).subscribe(response => {
            const updatedPosts = [...this.posts]
            const oldPostIndex= updatedPosts.findIndex(p => p.id === id)
            const post: Post = {
                id: id,
                title: title,
                content: content,
                imagePath: response.imagePath
            }
            updatedPosts[oldPostIndex] = postData
            this.posts = updatedPosts
            this.postsUpdated.next({posts: [...this.posts], maxPosts: 0})
            this.router.navigate(['/'])
        })
    }

    deletePost(postId: any) {
        this.http.delete<{message: string}>('http://localhost:3000/api/posts/'+postId).subscribe((response)=>{
            const updatedPosts = this.posts.filter(post => post.id != postId)
            this.posts = updatedPosts
            this.postsUpdated.next({posts: [...this.posts], maxPosts: 0})
        })
    }
}