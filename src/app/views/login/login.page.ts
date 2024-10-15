import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { AlertController} from '@ionic/angular';
import { AuthService } from '../../common/services/auth.service';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonList, IonItem, IonCard, IonInput, IonSpinner, IonButtons, IonButton, IonIcon, IonImg , IonCardHeader, IonCardContent, IonCardTitle} from '@ionic/angular/standalone';
import { FirestoreService } from 'src/app/common/services/firestore.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLabel,
    IonList,
    IonItem,
    IonCard,
    IonInput,
    IonSpinner,
    IonButtons,
    IonButton,
    IonIcon,
    IonImg,
    IonCardHeader,
    IonCardContent,
    IonCardTitle
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
loginForm: FormGroup;
  email: string = '';
  password: string = '';
  loginError: boolean = false;
  loginSuccess: boolean = false;


  constructor(
      private firestoreService: FirestoreService,
    private router: Router,
    // private alertController: AlertController,
    private fb: FormBuilder,
    // private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      dni: ['', Validators.required],
      password: ['', Validators.required]
    });



     // Añadimos el listener para los eventos del control remoto
    this.setupRemoteControlNavigation();
  }


  // Función para manejar la navegación con el control remoto
  setupRemoteControlNavigation() {
    document.addEventListener('keydown', (event) => {
      const key = event.key;
      const focusedElement = document.activeElement as HTMLElement;

      if (key === 'ArrowDown') {
        // Navegar al siguiente elemento
        this.focusNextElement(focusedElement);
      } else if (key === 'ArrowUp') {
        // Navegar al elemento anterior
        this.focusPreviousElement(focusedElement);
      } else if (key === 'Enter') {
        // Simular un click cuando se presiona Enter
        focusedElement?.click();
      }
    });
  }

  // Función para mover el foco al siguiente elemento
  focusNextElement(currentElement: HTMLElement) {
    const allFocusableElements = this.getFocusableElements();
    const currentIndex = allFocusableElements.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % allFocusableElements.length;
    allFocusableElements[nextIndex]?.focus();
  }

  // Función para mover el foco al elemento anterior
  focusPreviousElement(currentElement: HTMLElement) {
    const allFocusableElements = this.getFocusableElements();
    const currentIndex = allFocusableElements.indexOf(currentElement);
    const previousIndex = (currentIndex - 1 + allFocusableElements.length) % allFocusableElements.length;
    allFocusableElements[previousIndex]?.focus();
  }

  // Obtener todos los elementos que son focusables
  getFocusableElements(): HTMLElement[] {
    return Array.from(document.querySelectorAll('input, button')) as HTMLElement[];
  }


  async login() {
    if (this.loginForm.valid) {
      const { dni, password } = this.loginForm.value;

      try {
        const user = await this.firestoreService.loginUser(dni, password);
        if (user) {
          const userId = localStorage.getItem('userId');
          console.log('Inicio de sesión exitoso:', userId);
          this.loginSuccess = true;
          // await this.mostrarAlerta('Éxito', 'Inicio de sesión exitoso.');

          setTimeout(() => {
            this.router.navigateByUrl('/home');
          }, 1000);
        } else {
          this.loginError = true;
          // this.mostrarAlertaError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        // this.mostrarAlertaError('Ocurrió un error al iniciar sesión.');
      }
    } else {
      // this.mostrarAlertaError('Por favor, completa todos los campos correctamente.');
    }
  }



  // Variable para controlar si el mensaje se muestra o no
  showMessage: boolean = false;


 // Mostrar el mensaje de "Olvidé Mi Contraseña"
  showForgotPasswordMessage() {
    this.showMessage = true;
  }

  // Ocultar el mensaje de "Olvidé Mi Contraseña"
  closeForgotPasswordMessage() {
    this.showMessage = false;
  }


}
