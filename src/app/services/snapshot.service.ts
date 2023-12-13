import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnapshotService {

  constructor(private _http: HttpClient) { }

   apiUrl = 'https://example.com/upload';

  checkSnapshot(email: string) {
    const payload = { email }; 
    return this._http.post(this.apiUrl, payload).pipe(
      map((response) => {
        return response; // Map the response
      })
    );
  }
}
