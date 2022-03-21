import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { Post } from '../post.model'
import { PostsService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: Post[] = [] 
  isLoading = false
  totalPosts= 10
  pageSizeOptions = [1, 2, 5, 10]
  postPerPage = 2
  currentPage = 1

  constructor(public postsService: PostsService) {}

  ngOnInit(): void {
    this.isLoading = true
    this.postsService.getPost(this.postPerPage, this.currentPage)
    this.postsService.getPostUpdateListener().subscribe((posts: any) => {
      this.isLoading = false
      this.posts = posts.posts
      this.totalPosts = posts.maxPosts
    })
  }

  onDelete(id: any) {
    this.isLoading = true
    this.postsService.deletePost(id)
    this.ngOnInit()
    this.isLoading = false
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true
    this.currentPage = pageData.pageIndex + 1
    this.postPerPage = pageData.pageSize
    this.postsService.getPost(this.postPerPage, this.currentPage)
  }

}
