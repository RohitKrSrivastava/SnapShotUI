import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SnapshotService {

  constructor(private http: HttpClient) { }

  uploadImage(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('fileData', file);

    return this.http.post<any>(`${environment.apiUrl}LicencePlates`, formData);
  }

  getBooleanValue(): Observable<boolean> {
    const response = true; 
    return of(response).pipe(delay(2000));
  }

  getCheckValue(): Observable<boolean> {
    const response = true; 
    return of(response).pipe(delay(2000));
  }
}
