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
  // Triggered by the parent to refresh the gallery
  @Input() refresh!: boolean;

  // Emits the selected meme URL when a meme is clicked
  @Output() memeSelected = new EventEmitter<string>();

  // List of memes displayed in the gallery
  memes: string[] = [];

  // Loading state (used to show a spinner or disable UI)
  loading = false;

  // Carousel responsive settings
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

  // Load memes when the component is initialized
  ngOnInit() {
    this.loadMemes();
  }

  // Reload memes when the parent toggles "refresh"
  ngOnChanges(changes: SimpleChanges) {
    if (changes['refresh'] && this.refresh) this.loadMemes();
  }

  // Fetch all memes from the API
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

  // Handle meme selection and notify other components
  selectMeme(memeUrl: string) {
    console.log('Selected image:', memeUrl);
    this.memeService.selectImage(memeUrl);
  }
}

