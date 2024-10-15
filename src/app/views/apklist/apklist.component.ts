import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonToolbar, IonTitle, IonBackButton, IonButtons, ToastController, IonIcon, IonHeader, IonText } from '@ionic/angular/standalone';
import { FirestoreService } from './../../common/services/firestore.service';
import { Video } from './../../common/models/video.model'; // Asegúrate de tener este modelo
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-apk-list',
   standalone: true,
  imports: [IonText, IonHeader, CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonList,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonIcon],
  templateUrl: './apklist.component.html',
  styleUrls: ['./apklist.component.scss'],
})
export class ApkListComponent implements OnInit {
   nombreVideo: string = '';
  descripcionVideo: string = '';
  videos: Video[] = [];

  imagenArchivo: File | null = null;
  videoArchivo: File | null = null;

  constructor(
    private FirestoreService: FirestoreService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarVideos();
  }

   irALaLista() {
  this.router.navigate(['/aplicaciones']); 
}

  async cargarVideos() {
    this.FirestoreService.getCollectionChanges<Video>('videos').subscribe(
      (data) => {
        this.videos = data;
      },
      (error) => {
        console.error('Error al cargar videos:', error);
      }
    );
  }

  onFileSelected(event: any, tipo: string) {
    const file = event.target.files[0];
    if (tipo === 'imagen') {
      this.imagenArchivo = file;
    } else if (tipo === 'video') {
      this.videoArchivo = file;
    }
  }

  async subirVideo() {
    if (!this.videoArchivo) {
      this.mostrarToast('Debe seleccionar un archivo de video', 'danger');
      return;
    }

    const id = uuidv4();
    const videoData: Video = {
      id,
      nombre: this.nombreVideo,
      descripcion: this.descripcionVideo,
    };

    try {
      // Asignación de propiedades dinámicas
      if (this.imagenArchivo) {
        const imagenUrl = await this.FirestoreService.uploadFile(this.imagenArchivo, `imagenes/${id}`);
        videoData.imagenUrl = imagenUrl;  // No más errores aquí
      }

      const videoUrl = await this.FirestoreService.uploadFile(this.videoArchivo, `videos/${id}`);
      videoData.videoUrl = videoUrl;

      await this.FirestoreService.createDocument(videoData, `videos/${id}`);
      this.mostrarToast('Video subido exitosamente', 'success');
      this.nombreVideo = '';
      this.descripcionVideo = '';
      this.imagenArchivo = null;
      this.videoArchivo = null;
      this.cargarVideos(); // Recargar la lista de videos después de subir
    } catch (error) {
      console.error('Error al subir el video:', error);
      this.mostrarToast('Error al subir el video', 'danger');
    }
  }

  async borrarVideo(videoId: string) {
    try {
      await this.FirestoreService.deleteDocumentID('videos', videoId);
      this.mostrarToast('Video eliminado exitosamente', 'success');
      this.cargarVideos(); // Recargar la lista de videos después de eliminar
    } catch (error) {
      console.error('Error al eliminar el video:', error);
      this.mostrarToast('Error al eliminar el video', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }
}
