import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConceptMapComponent } from './componlents/concept-map/concept-map.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ConceptMapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular_map';
}
