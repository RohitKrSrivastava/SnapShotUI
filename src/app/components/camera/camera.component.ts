import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SnapshotService } from 'src/app/services/snapshot.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement: ElementRef | any;
  @ViewChild('imagePreview') imagePreview: ElementRef | any;
  public stream: MediaStream | any;
  public capturedImage: string | null = null;
  public showMenu: boolean = false;
  public showCamera: boolean = false;
  showScan =true
  isImageUpload=false;
  isImageCaptured=false;

  constructor(private _snapshotService: SnapshotService) {}

  ngAfterViewInit() {}

  startCamera() {
    this.capturedImage = null;
    this.showCamera = true;
    this.showScan=false
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream: MediaStream) => {
        this.stream = stream;
        this.videoElement.nativeElement.srcObject = stream;
        console.log('Camera stream started successfully:', stream);
      })
      .catch((error: any) => {
        this.handleCameraError(error);
      });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track: { stop: () => any }) => track.stop());
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  captureImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = this.videoElement.nativeElement;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    this.capturedImage = canvas.toDataURL('image/jpeg');
    this.showCamera = false;
    this.isImageCaptured=true;
    this.isImageUpload=false;

    if (this.imagePreview) {
      this.imagePreview.nativeElement.src = this.capturedImage;
    }

    this.stopCamera();
  }

  confirmAndSend() {
    if (confirm('Do you want to send this image to the API?')) {
      this.sendImageToApi(this.capturedImage);
    }
  }

  sendImageToApi(imageData: string | null) {
    this.isImageCaptured=false;
    this.isImageUpload=false;
    if (!imageData) {
      console.error('No captured image to send.');
      return;
    }

    this._snapshotService.checkSnapshot(imageData).subscribe(
      {
        next: (response) => this.handleApiSuccess(response),
        error: (error) => this.handleApiError(error),
        complete: () => this.handleApiComplete()
      }
    );
  }

  uploadImage(event: any): void {
    this.showScan=false
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.capturedImage = e.target.result;
        this.isImageCaptured=false;
        this.isImageUpload=true;
      };
      reader.readAsDataURL(file);
    }
  }

  showUploadMenu(): void {
    this.showMenu = !this.showMenu;
    this.showCamera = false;
  }

  private handleCameraError(error: any): void {
    console.error('Error accessing camera:', error);
    console.log('Navigator:', navigator);
    console.log('MediaDevices:', navigator.mediaDevices);
    console.log('Error Name:', error.name);
    console.log('Error Message:', error.message);
  }

  private handleApiSuccess(response: any): void {
    console.log('API Response:', response);
  }

  private handleApiError(error: any): void {
    console.error('Error sending image to API:', error);
  }

  private handleApiComplete(): void {
    // Additional completion logic if needed
  }

  licenseScan(){
    this.showScan=true
    this.showCamera=false
  }
}
