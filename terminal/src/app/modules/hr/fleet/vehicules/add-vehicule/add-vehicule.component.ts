import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';

// Ck Editer
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'sifca-monorepo-add-vehicule',
  templateUrl: './add-vehicule.component.html',
  styleUrls: ['./add-vehicule.component.scss'],
})

/**
 * AddProduct Component
 */
export class AddVehiculeComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  // public Editor = ClassicEditor;
  public files: NgxFileDropEntry[] = [];
  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.CREATE_PRODUCT').subscribe((createProduct: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: createProduct, active: true }];
      });
    });
  }

  /**
   * Multiple Default Select2
   */
  selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event) {
  }

  public fileLeave(event) {
  }
}
