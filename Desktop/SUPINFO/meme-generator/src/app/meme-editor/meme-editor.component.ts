import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MemeService } from '../services/meme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meme-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-editor.component.html',
  styleUrls: ['./meme-editor.component.css'] // corrigé: styleUrls au pluriel
})
export class MemeEditorComponent {
  @ViewChild('memeCanvas', { static: false }) memeCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() memeSaved = new EventEmitter<void>();
  selectedImage: string | null = null;
  text: string = ''; // ✅ Un seul texte

  // textTop = '';
  // textBottom = '';
  imageFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;

  // Taille fixe du canvas
  canvasWidth = 500;
  canvasHeight = 500;

  // Position du texte
  textX = this.canvasWidth / 2;
  textY = this.canvasHeight / 2;

  // Dragging
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;


  showSharePopup = false;
lastSavedUrl: string | null = null; // URL du dernier mème uploadé

toggleShare() {
  this.showSharePopup = !this.showSharePopup;
}
  constructor(private memeService: MemeService) {}



 ngOnInit() {
    this.memeService.selectedImage$.subscribe(image => {
      console.log('my imaagee ====>>>>>>>>>>>>>>>>>>>>',image)
      this.selectedImage = image;
      this.previewUrl = image; // ✅ Utilisée dans drawMeme()
      this.drawMeme(); // ✅ Affiche automatiquement sur le canvas
    });
  }
    onImageSelected(event: any) {
    this.imageFile = event.target.files[0];
    if (!this.imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.drawMeme();
    };
    reader.readAsDataURL(this.imageFile);
  }

  // drawMeme() {
  //   if (!this.previewUrl || !this.memeCanvas) return;

  //   const canvas = this.memeCanvas.nativeElement;
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   const image = new Image();
  //   image.crossOrigin = 'anonymous';
  //   image.src = this.previewUrl;
  //   image.onload = () => {
  //     // FIX: Taille fixe du canvas
  //     canvas.width = this.canvasWidth;
  //     canvas.height = this.canvasHeight;

  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     // Dessiner l'image en remplissant tout le canvas
  //     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  //     // Texte
  //     ctx.font = '40px Impact';
  //     ctx.fillStyle = 'white';
  //     ctx.strokeStyle = 'black';
  //     ctx.lineWidth = 3;
  //     ctx.textAlign = 'center';

  //     ctx.fillText(this.textTop.toUpperCase(), canvas.width / 2, 50);
  //     ctx.strokeText(this.textTop.toUpperCase(), canvas.width / 2, 50);

  //     ctx.fillText(this.textBottom.toUpperCase(), canvas.width / 2, canvas.height - 20);
  //     ctx.strokeText(this.textBottom.toUpperCase(), canvas.width / 2, canvas.height - 20);
  //   };
  // }


 drawMeme() {
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

    // Texte à la position dynamique
    ctx.font = '40px Impact';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';

    ctx.fillText(this.text.toUpperCase(), this.textX, this.textY);
    ctx.strokeText(this.text.toUpperCase(), this.textX, this.textY);
  };
}

  downloadMeme() {
    if (!this.memeCanvas) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = this.memeCanvas.nativeElement.toDataURL('image/png');
    link.click();
  }

  async saveMeme() {
    if (!this.memeCanvas) return;

    const blob: Blob | null = await new Promise(resolve => this.memeCanvas.nativeElement.toBlob(resolve, 'image/png'));
    if (!blob) return;

    const file = new File([blob], 'meme.png', { type: 'image/png' });
    this.loading = true;

    this.memeService.uploadMeme(file).subscribe({
      next: (res: any) => {
        this.loading = false;
              this.lastSavedUrl = res.url; // ✅ on garde l’URL pour le partage

        alert('✅ Mème enregistré avec succès !');
        this.memeSaved.emit(); // rafraîchit la galerie
      },
      error: err => {
        console.error(err);
        this.loading = false;
        alert('❌ Erreur lors de l’enregistrement du mème.');
      }
    });
  }

   /*** 🖱️ GESTION DU DRAG ***/
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

    // Vérifie si le clic est sur le texte
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
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.textX = mouseX - this.dragOffsetX;
    this.textY = mouseY - this.dragOffsetY;
    this.drawMeme();
  }

  stopDragging() {
    this.isDragging = false;
  }

async shareMeme() {
  const canvas = this.memeCanvas.nativeElement;

  const blob: Blob | null = await new Promise(resolve =>
    canvas.toBlob(resolve, 'image/png')
  );

  if (!blob) return;

  const file = new File([blob], 'meme.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Mon super mème 😄',
        text: 'Regarde ce mème que j’ai créé !',
        files: [file],
      });
    } catch (err) {
      console.log('Partage annulé ou erreur :', err);
    }
  } else {
    alert("❌ Le partage n'est pas supporté sur ce navigateur.");
  }
}

// shareOnFacebook() {
//   if (!this.selectedImage) return alert("Sauvegarde d'abord ton mème avant de partager !");
//   const url = encodeURIComponent(this.selectedImage);
//   console.log('img urlll =========>>>>>>>>>>>', url)
//   window.open(`https://www.facebook.com/sharer/sharer.php?u=${this.selectedImage}`, '_blank');
// }
shareOnFacebook() {
    if (!this.selectedImage) {
    alert("⚠️ Aucune image à partager !");
    return;
  }
  if (navigator.share) {
    navigator.share({
      title: 'Mon super mème 😂',
      text: 'Regarde ce que j’ai créé !',
      url: this.selectedImage,
    }).catch(err => console.log('Erreur de partage', err));
  } else {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.selectedImage)}`,
      '_blank'
    );
  }
}

shareOnTwitter() {
  const text = encodeURIComponent('Regarde ce mème que j’ai créé 😄');
  const url = encodeURIComponent(this.previewUrl || '');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

shareOnWhatsApp() {
  const text = encodeURIComponent('Regarde ce mème que j’ai créé 😄 ' + (this.previewUrl || ''));
  window.open(`https://wa.me/?text=${text}`, '_blank');
}




}
