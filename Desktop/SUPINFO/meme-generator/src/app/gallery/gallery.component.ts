import { Component, EventEmitter, importProvidersFrom, Input, Output, SimpleChanges } from '@angular/core';
import { MemeService } from '../services/meme.service';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-gallery',

  imports: [CommonModule,CarouselModule ,ButtonModule],
  templateUrl: './gallery.component.html',
styleUrls: ['./gallery.component.css']})
export class GalleryComponent {
 @Input() refresh!: boolean;
@Output() memeSelected = new EventEmitter<string>(); //  émet l’URL du mème sélectionné

  memes: string[] = [];
  loading = false;
////currentIndex = 0;
//slideWidth = 210; // largeur d'une image + margin
 responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];


  constructor(private memeService: MemeService) {}
ngOnInit(){
  this.loadMemes()
}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['refresh'] && this.refresh) this.loadMemes();
  }

  loadMemes() {
    this.loading = true;
    this.memeService.getAllMemes().subscribe({
      next: res => {
        this.memes = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
   selectMeme(memeUrl: string) {
    console.log('selecteeed imaage ', memeUrl)
       this.memeService.selectImage(memeUrl);

  }
//   getTransform() {
//   return `translateX(-${this.currentIndex * this.slideWidth}px)`;
// }

// prevSlide() {
//   if (this.currentIndex > 0) {
//     this.currentIndex--;
//   }
// }

// nextSlide() {
//   if (this.currentIndex < this.memes.length - Math.floor(600 / this.slideWidth)) {
//     this.currentIndex++;
//   }
// }
}
