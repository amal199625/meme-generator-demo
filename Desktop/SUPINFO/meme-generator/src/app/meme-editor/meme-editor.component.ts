import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { MemeService } from '../services/meme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faTwitter, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faTimes, faTrash, faUpload, faDownload, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-meme-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './meme-editor.component.html',
  styleUrls: ['./meme-editor.component.css']
})
export class MemeEditorComponent {
  // Canvas reference for drawing the meme
  @ViewChild('memeCanvas', { static: false }) memeCanvas!: ElementRef<HTMLCanvasElement>;

  // Event emitted when a meme is saved
  @Output() memeSaved = new EventEmitter<void>();

  // Meme data and state
  selectedImage: string | null = null;
  text: string = '';
  imageFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  showSharePopup = false;
  lastSavedUrl: string | null = null;

  // Canvas and text position
  canvasWidth = 500;
  canvasHeight = 500;
  textX = this.canvasWidth / 2;
  textY = this.canvasHeight / 2;
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;

  private objectUrl: string | null = null;

  // FontAwesome icons
  faFacebookF = faFacebookF;
  faTwitter = faTwitter;
  faWhatsapp = faWhatsapp;
  faTelegram = faTelegram;
  faTimes = faTimes;
  faTrash = faTrash;
  faUpload = faUpload;
  faDownload = faDownload;
  faShareAlt = faShareAlt;

  constructor(private memeService: MemeService) {}

  // Load selected image and draw it on the canvas
  ngOnInit() {
    this.memeService.selectedImage$.subscribe(image => {
      this.selectedImage = image;
      this.previewUrl = image;
      this.lastSavedUrl = image;

      this.drawMeme();
    });
  }

  // Upload a new image from the device
  onImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);

    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.objectUrl;

    this.imageFile = file;
    this.drawMeme();
  }

  // Remove the current image and reset the editor
  removeImage() {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);

    this.previewUrl = null;
    this.selectedImage = null;
    this.imageFile = null;
    this.text = '';
    this.lastSavedUrl = null;
    this.isDragging = false;
    this.textX = this.canvasWidth / 2;
    this.textY = this.canvasHeight / 2;

    const ctx = this.memeCanvas?.nativeElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  // Draw image and text on canvas
  async drawMeme() {
    if (!this.previewUrl || !this.memeCanvas) return;

    const canvas = this.memeCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = this.previewUrl;

    image.onload = () => {
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      ctx.font = '40px Impact';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;

      const text = this.text?.toUpperCase() || '';
      ctx.fillText(text, this.textX, this.textY);
      ctx.strokeText(text, this.textX, this.textY);
    };
  }

  // Download the meme as a PNG image
  downloadMeme() {
    if (!this.memeCanvas) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = this.memeCanvas.nativeElement.toDataURL('image/png');
    link.click();
  }

  // Save the meme to the server
  async saveMeme() {
    if (!this.memeCanvas) return;

    const blob: Blob | null = await new Promise(resolve =>
      this.memeCanvas.nativeElement.toBlob(resolve, 'image/png')
    );
    if (!blob) return;

    const file = new File([blob], 'meme.png', { type: 'image/png' });
    this.loading = true;

    this.memeService.uploadMeme(file).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.lastSavedUrl = res.url;
        this.showSharePopup = true;
        this.memeSaved.emit();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Handle drag and drop for moving text
  startDragging(event: MouseEvent) {
    const canvas = this.memeCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '40px Impact';
    const textWidth = ctx.measureText(this.text).width;
    const textHeight = 40;

    if (
      mouseX >= this.textX - textWidth / 2 &&
      mouseX <= this.textX + textWidth / 2 &&
      mouseY >= this.textY - textHeight &&
      mouseY <= this.textY
    ) {
      this.isDragging = true;
      this.dragOffsetX = mouseX - this.textX;
      this.dragOffsetY = mouseY - this.textY;
    }
  }

  dragText(event: MouseEvent) {
    if (!this.isDragging) return;
    const canvas = this.memeCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.textX = event.clientX - rect.left - this.dragOffsetX;
    this.textY = event.clientY - rect.top - this.dragOffsetY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = this.previewUrl!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    this.drawText(ctx);
  }

  drawText(ctx: CanvasRenderingContext2D) {
    ctx.font = '40px Impact';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.fillText(this.text, this.textX, this.textY);
    ctx.strokeText(this.text, this.textX, this.textY);
  }

  stopDragging() {
    this.isDragging = false;
  }

  // Toggle share popup
  toggleShare() {
    this.showSharePopup = !this.showSharePopup;
  }

  // Share meme on social networks
  shareOnFacebook() {
    console.log('the last url=====>',this.lastSavedUrl)
    if (!this.lastSavedUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.lastSavedUrl)}`,
      '_blank'
    );
  }

  shareOnTwitter() {
    const text = encodeURIComponent('Check out this meme I created 😄');
    const url = encodeURIComponent(this.lastSavedUrl || '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  shareOnWhatsApp() {
    const text = encodeURIComponent('Check out this meme I created 😄 ' + (this.lastSavedUrl || ''));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}

