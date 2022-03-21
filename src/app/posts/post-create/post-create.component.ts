import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { PostsService } from '../post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  enteredTitle = ''
  enteredContent = ''
  post: any
  isLoading = false 
  form: FormGroup
  imagePreview: any
  private mode = 'create'
  private postId: any

  constructor(public postsService: PostsService, public route: ActivatedRoute) {
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'image': new FormControl(null, {validators: [Validators.required]})
    })
  }

  ngOnInit(): void {    
    this.route.paramMap.subscribe((paramMap: ParamMap)=>{
      if (paramMap.has('id')) {
        this.mode = 'edit'
        this.postId = paramMap.get('id')
        this.isLoading = true
        this.postsService.findPost(this.postId).subscribe(postData => {
          this.isLoading = false
          this.post = {
            id: postData._id, 
            title: postData.title, 
            content: postData.content,
            ImagePath: postData.imagePath
          }
          this.form.setValue({
            'title': postData.title,
            'content': postData.content,
            'image': postData.imagePath
          })
        })
      } else {
        this.mode = 'create'
        this.postId = null
      }
    })
  }

  onImagePicked(event: Event) {
    const file: any = (event.target as HTMLInputElement).files
    this.form.patchValue({image: file[0]})
    this.form.get('image')?.updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result
    }
    reader.readAsDataURL(file[0])

    let ext = file[0].name.match(/\.([^\.]+)$/)[1];
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        // action
        break;
      default:
        alert('This file is not valid! Please select a valid image file!');
    }
  }

  onSavePost() {
    if (this.form.invalid) {
      return
    }
    this.isLoading = true
    if (this.mode === 'create') {
      this.postsService.addPost(0, this.form.value.title, this.form.value.content, this.form.value.image)
      this.form.reset()
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
    }
    this.isLoading = false
    
  }  

}
