import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard, IonThumbnail, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTextarea, IonToolbar, IonTitle, IonBackButton, IonButtons, ToastController, IonIcon, IonHeader, IonText } from '@ionic/angular/standalone';
import { FirestoreService } from './../../common/services/firestore.service';
import { Categoria } from './../../common/models/categoria.models';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';




@Component({
  selector: 'app-apk',
  standalone: true,
  imports: [IonText, IonHeader,  CommonModule,
    FormsModule,
IonThumbnail,
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
    IonSelect,
    IonSelectOption,
    IonList,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonIcon],
  templateUrl: './apk.component.html',
  styleUrls: ['./apk.component.scss'],
})
export class ApkComponent  implements OnInit {

nombreApk: string = '';
  descripcionApk: string = '';
  categoriaSeleccionada: string | null = null;
  apks: any[] = [];
  categorias: Categoria[] = [];

  imagenArchivo: File | null = null;
  apkArchivo: File | null = null;

      enlaceDescarga: string = ''; // Nueva propiedad para el enlace de descarga


  constructor(
    private FirestoreService: FirestoreService,
    private toastController: ToastController,
      private router: Router // Agrega Router aquí

  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarApks();
    this.addKeyboardNavigation(); // Navegación por teclado
   this.addRemoteNavigation();   // Navegación por control remoto

  }

  irALaLista() {
  this.router.navigate(['/lista']); // Reemplaza con la ruta correcta
}

  async cargarCategorias() {
    this.FirestoreService.getCollectionChanges<Categoria>('categorias').subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  async cargarApks() {
    this.FirestoreService.getCollectionChanges<any>('apks').subscribe(
      (data) => {
        this.apks = data;
      },
      (error) => {
        console.error('Error al cargar APKs:', error);
      }
    );
  }

  onFileSelected(event: any, tipo: string) {
    const file = event.target.files[0];
    if (tipo === 'imagen') {
      this.imagenArchivo = file;
    } else if (tipo === 'apk') {
      this.apkArchivo = file;
    }
  }

  async subirApk() {
    if (!this.apkArchivo) {
      this.mostrarToast('Debe seleccionar un archivo APK', 'danger');
      return;
    }

    const id = uuidv4();
   const apkData: {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string | null;
  fechaCreacion: Date;
  imagenUrl?: string;  // Propiedad opcional
  apkUrl?: string;     // Propiedad opcional
    enlaceDescarga?: string;

} = {
  id,
  nombre: this.nombreApk,
  descripcion: this.descripcionApk,
  categoriaId: this.categoriaSeleccionada,
  fechaCreacion: new Date(),
    enlaceDescarga: this.enlaceDescarga || undefined,

};

    try {
     // Asignación de propiedades dinámicas
if (this.imagenArchivo) {
  const imagenUrl = await this.FirestoreService.uploadFile(this.imagenArchivo, `imagenes/${id}`);
  apkData.imagenUrl = imagenUrl;  // No más errores aquí
}

const apkUrl = await this.FirestoreService.uploadFile(this.apkArchivo, `apks/${id}`);
apkData.apkUrl = apkUrl;

      await this.FirestoreService.createDocument(apkData, `apks/${id}`);
      this.mostrarToast('APK subido exitosamente', 'success');
      this.nombreApk = '';
      this.descripcionApk = '';
      this.imagenArchivo = null;
      this.apkArchivo = null;
      this.enlaceDescarga = '';

      this.cargarApks(); // Recargar la lista de APKs después de subir
    } catch (error) {
      console.error('Error al subir el APK:', error);
      this.mostrarToast('Error al subir el APK', 'danger');
    }
  }

  async borrarApk(apkId: string) {
    try {
      await this.FirestoreService.deleteDocumentID('apks', apkId);
      this.mostrarToast('APK eliminado exitosamente', 'success');
      this.cargarApks(); // Recargar la lista de APKs después de eliminar
    } catch (error) {
      console.error('Error al eliminar el APK:', error);
      this.mostrarToast('Error al eliminar el APK', 'danger');
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


  handleOpenLink(enlace: string) {
  if (enlace) {
    // Abre el enlace en una nueva pestaña
    window.open(enlace, '_blank');
  }
}




 // Agregar navegación por teclado
  addKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      let currentFocus = document.activeElement;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        let nextFocus;
        if (event.key === 'ArrowDown') {
          nextFocus = currentFocus?.nextElementSibling;
        } else if (event.key === 'ArrowUp') {
          nextFocus = currentFocus?.previousElementSibling;
        }

        if (nextFocus && nextFocus.hasAttribute('tabindex')) {
          (nextFocus as HTMLElement).focus();
        }
      }
    });
  }

  // Acción cuando se presiona Enter para descargar un APK
  // handleEnter(apkUrl: string) {
  //   window.location.href = apkUrl;
  // }



// Agregar navegación por control remoto
addRemoteNavigation() {
  document.addEventListener('keydown', (event) => {
    let currentFocus = document.activeElement;

    // Detectar teclas del control remoto o flechas de teclado
    switch(event.key) {
      case 'ArrowDown':
        this.navigateToNextElement(currentFocus, 'down');
        break;
      case 'ArrowUp':
        this.navigateToNextElement(currentFocus, 'up');
        break;
      case 'ArrowLeft':
        this.navigateToNextElement(currentFocus, 'left');
        break;
      case 'ArrowRight':
        this.navigateToNextElement(currentFocus, 'right');
        break;
      case 'Enter':
      case 'OK': // Para algunos controles remotos, 'OK' podría ser un valor válido
        this.handleEnter(currentFocus?.getAttribute('data-url') || '');
        break;
      default:
        break;
    }
  });
}

// Navegar entre los elementos enfocados
navigateToNextElement(currentFocus: Element | null, direction: string) {
  let nextFocus: Element | null = null;

  switch(direction) {
    case 'down':
      nextFocus = currentFocus?.nextElementSibling;
      break;
    case 'up':
      nextFocus = currentFocus?.previousElementSibling;
      break;
    case 'left':
      // Lógica adicional si tienes navegación horizontal
      break;
    case 'right':
      // Lógica adicional si tienes navegación horizontal
      break;
    default:
      break;
  }

  // Enfocar el siguiente elemento si es navegable
  if (nextFocus && nextFocus.hasAttribute('tabindex')) {
    (nextFocus as HTMLElement).focus();
  }
}


handleEnter(apkUrl: string) {
  if (apkUrl) {
    // Abrir el archivo APK en una nueva pestaña, el sistema debería manejar la descarga
    window.open(apkUrl, '_blank');
  }
}










}
