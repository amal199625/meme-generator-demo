import { Component } from '@angular/core';
import { GalleryComponent } from './gallery/gallery.component';
import { MemeEditorComponent } from './meme-editor/meme-editor.component';

@Component({
  selector: 'app-root',
  imports: [MemeEditorComponent, GalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'meme-generator';
    refreshGallery = false;
  selectedMemeUrl: string | null = null;

  onMemeSaved() {
        // déclenche le rafraîchissement de la galerie

    this.refreshGallery = !this.refreshGallery; // recharge la galerie
  }
  
}
