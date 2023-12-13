import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plate } from 'src/app/Interfaces/ISnapshot';
import { SnapshotService } from 'src/app/services/snapshot.service';



@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit , AfterViewInit {
  @ViewChild('videoElement') videoElement: ElementRef | any;
  @ViewChild('imagePreview') imagePreview: ElementRef | any;

  public stream: MediaStream | any = null;
  public capturedImage: string | null = null;
  public showMenu: boolean = false;
  public showCamera: boolean = false;
  public showScan: boolean = true;
  public isImageUpload: boolean = false;
  public isImageCaptured: boolean = false;
  public isApiCalled: boolean = false;
  public isDataSaved: boolean = false;
  public saveDataLoader: boolean = false;

  public plate: Plate = {
    code: "",
    region: { height: 0, width: 0, x: 0, y: 0 },
    tag: ""
  };

  public thumbsUpClicked: boolean = false;
  public thumbsDownClicked: boolean = false;
  public editMode: boolean = false;
  public editCode: boolean = false;
  public editHeight: boolean = false;
  public editWidth: boolean = false;
  public editTag: boolean = false;

  constructor(private _snapshotService: SnapshotService, private _snackBar: MatSnackBar,  private renderer: Renderer2) {}

  ngOnInit(): void {
    this.plate = { code: "", region: { height: 0, width: 0, x: 0, y: 0 }, tag: "" };
  }

  ngAfterViewInit() {}

  async startCamera(): Promise<void> {
    this.capturedImage = null;
    this.showCamera = true;
    this.showScan = false;

    try {
      const videoConstraints = { video: { facingMode: 'environment' } };
      this.stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', this.stream);
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
      this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', null);
    }
  }

  captureImage(): void {
    this.capturedImage = null;
    this.plate = { code: "", region: { height: 0, width: 0, x: 0, y: 0 }, tag: "" };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = this.videoElement.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.capturedImage = canvas.toDataURL('image/jpeg');

    const blob = this.dataURLtoBlob(this.capturedImage);

    const convertedFile = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
    this.sendImageToApi(convertedFile);
    this.showCamera = false;
    this.isImageCaptured = true;

    if (this.imagePreview) {
      this.imagePreview.nativeElement.src = this.capturedImage;
    }

    this.stopCamera();
  }

  dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  sendImageToApi(imageData: any | null): void {
    if (!imageData) {
      console.error('No captured image to send.');
      return;
    }

    this.isApiCalled = true;
    this.thumbsUpClicked = false;
    this.thumbsDownClicked = false;

    this._snapshotService.uploadImage(imageData).subscribe({
      next: (response) => this.handleApiSuccess(response),
      error: (error) => this.handleApiError(error),
      complete: () => this.handleApiComplete()
    });
  }

  uploadImage(event: any): void {
    this.showScan = false;
    this.capturedImage = null;
    this.plate = { code: "", region: { height: 0, width: 0, x: 0, y: 0 }, tag: "" };

    const file = event.target.files[0];
    this.sendImageToApi(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.capturedImage = e.target.result;
        this.isImageCaptured = false;
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
    this.licenseScan();
    this.openSnackBar(error.message, 'OK')
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', null);
  }

  private handleApiSuccess(response: any): void {
    this.plate = {
      code: response.plate?.code,
      region:response.plate?.region,
      tag: response.plate?.tag
    };
    if(!this.plate.code && !this.plate.tag){
      this.licenseScan()
      this.openSnackBar('No data found!', 'OK');
    }
  }

  private handleApiError(error: any): void {
    console.error('Error sending image to API:', error);
    this.licenseScan()
    this.openSnackBar('No data found!', 'OK');
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }
  private handleApiComplete(): void {
    this.isApiCalled = false;
    this.isImageUpload = true;
  }

  licenseScan(): void {
    this.showScan = true;
    this.showCamera = false;
    this.isImageCaptured = false;
    this.isImageUpload = false;
    this.thumbsUpClicked = false;
    this.thumbsDownClicked = false;
    this.isDataSaved = false;
    this.editMode = false;
    this.editCode = false;
    this.editTag = false;

    this.plate = { code: "", region: { height: 0, width: 0, x: 0, y: 0 }, tag: "" };
  }

  toggleEditMode(type: string): void {
    switch (type) {
      case 'code':
        this.editCode = !this.editCode;
        break;
      case 'width':
        this.editWidth = !this.editWidth;
        break;
      case 'height':
        this.editHeight = !this.editHeight;
        break;
      case 'tag':
        this.editTag = !this.editTag;
        break;
      default:
        break;
    }
  }

  editImageData(): void {
    this.editMode = !this.editMode;
  }

  saveData(): void {
    this.saveDataLoader = true;
    this._snapshotService.getBooleanValue().subscribe({
      next: (response) => this.handleSaveApiSuccess(response),
      error: (error) => this.handleSaveApiError(error),
      complete: () => this.handleSaveApiComplete()
    });
  }

  private handleSaveApiSuccess(response: any): void {
    this.isDataSaved = response;
  }

  private handleSaveApiError(error: any): void {
    console.error('Error sending image to API:', error);
  }

  private handleSaveApiComplete(): void {
    this.saveDataLoader = false;
    this.editMode = false;
  }
}
