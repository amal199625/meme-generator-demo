import { Component } from '@angular/core';
import { GalleryComponent } from './gallery/gallery.component';
import { MemeEditorComponent } from './meme-editor/meme-editor.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLaughBeam } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  imports: [MemeEditorComponent, GalleryComponent ,FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
 // App title
  title = 'meme-generator';

  // Used to refresh the gallery after saving a new meme
  refreshGallery = false;

  // Stores the URL of the selected meme
  selectedMemeUrl: string | null = null;

  // Icon used in the title (fun visual touch)
  faLaughBeam = faLaughBeam;

  // Called when a meme is saved → refreshes the gallery
  onMemeSaved() {
        // déclenche le rafraîchissement de la galerie

    this.refreshGallery = !this.refreshGallery; // recharge la galerie
  }
  
}
