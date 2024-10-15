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



  playVideo(videoUrl: string) {
  const videoElement = document.createElement('video');

  // Configurar el elemento de video
  videoElement.src = videoUrl;
  videoElement.controls = true;
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';
  videoElement.style.position = 'fixed';
  videoElement.style.top = '0';
  videoElement.style.left = '0';
  videoElement.style.zIndex = '9999';
  videoElement.autoplay = true;

  // Agregar el video al cuerpo del documento
  document.body.appendChild(videoElement);

  // Solicitar pantalla completa
  if (videoElement.requestFullscreen) {
    videoElement.requestFullscreen();
  } else if ((videoElement as any).webkitRequestFullscreen) { /* Safari */
    (videoElement as any).webkitRequestFullscreen();
  } else if ((videoElement as any).msRequestFullscreen) { /* IE11 */
    (videoElement as any).msRequestFullscreen();
  }

  // Escuchar cuando el video termina o se cierra el fullscreen
  videoElement.onended = () => {
    this.exitFullscreen(videoElement);
  };

  // Permitir salir del video con el control remoto o escape
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.exitFullscreen(videoElement);
    }
  });
}

exitFullscreen(videoElement: HTMLVideoElement) {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) { /* Safari */
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) { /* IE11 */
    (document as any).msExitFullscreen();
  }

  // Remover el video del DOM después de salir del modo fullscreen
  if (videoElement) {
    videoElement.pause();
    videoElement.src = '';
    videoElement.remove();
  }
}


 // Función para manejar el enfoque del video
  onFocus(index: number) {
    const videoItem = document.querySelectorAll('.video-item')[index] as HTMLElement;
    videoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    videoItem.classList.add('focused'); // Añadir clase para efectos adicionales
  }

  // Función para manejar el desenfoque del video
  onBlur(index: number) {
    const videoItem = document.querySelectorAll('.video-item')[index] as HTMLElement;
    videoItem.classList.remove('focused'); // Remover clase cuando se pierde el enfoque
  }


}
