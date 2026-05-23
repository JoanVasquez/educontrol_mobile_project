import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-feature-placeholder',
  templateUrl: './feature-placeholder.page.html',
  styleUrls: ['./feature-placeholder.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent],
})
export class FeaturePlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] as string;
  readonly activePath = this.route.snapshot.data['activePath'] as string;
}
