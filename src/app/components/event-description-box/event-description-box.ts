import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-event-description-box',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-description-box.html',
    styleUrls: ['./event-description-box.css']
})
export class EventDescriptionBoxComponent {
    @Input() description: string = '';

    ngOnInit() {
        console.log('Description Box - description:', this.description);
    }
}
