import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll } from '@angular/fire/storage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemeService {
private selectedImageSource = new BehaviorSubject<string | null>(null);
  selectedImage$ = this.selectedImageSource.asObservable();
  constructor(private http: HttpClient) {}

   private apiUrl = 'http://localhost:3000';



 uploadMeme(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('meme', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getAllMemes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/memes`);
  }
  selectImage(imageUrl: string) {
    this.selectedImageSource.next(imageUrl);
  }
}
