import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-school-logo',
  template: `
    <div class="school-logo" [class]="size">
      <div class="logo-container">
        <!-- School Logo Image -->
        <img src="assets/images/anarphy_logo.svg" 
             alt="ANARPHY HIGH SCHOOL Logo" 
             class="school-logo-img">
        
        <!-- Fallback if image fails to load -->
        <div class="fallback-logo" style="display: none;">
          <div class="fallback-shield">
            <div class="fallback-text">AHS</div>
          </div>
        </div>
      </div>
      
      <!-- School Name -->
      <div class="school-name">
        <div class="school-name-main">ANARPHY</div>
        <div class="school-name-sub">HIGH SCHOOL</div>
      </div>
    </div>
  `,
  styles: [`
    .school-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      text-align: center;
    }

    .logo-container {
      position: relative;
      margin-bottom: 12px;
      background: var(--anarchy-white, #ffffff);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 15px rgba(30, 58, 138, 0.1);
    }

    .school-logo-img {
      width: 100%;
      height: auto;
      max-width: 120px;
      max-height: 120px;
      object-fit: contain;
      border-radius: 8px;
      /* Remove white background and make it blend with container */
      filter: contrast(1.1) saturate(1.1);
    }

    .fallback-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
    }

    .fallback-shield {
      width: 80px;
      height: 80px;
      background: var(--anarchy-blue);
      border: 3px solid var(--anarchy-gold);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
    }

    .fallback-text {
      color: white;
      font-size: 24px;
      font-weight: bold;
      font-family: 'Playfair Display', serif;
    }

    .school-name {
      text-align: center;
    }

    .school-name-main {
      font-size: 20px;
      font-weight: 700;
      color: var(--anarchy-blue);
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
      font-family: 'Playfair Display', serif;
    }

    .school-name-sub {
      font-size: 12px;
      font-weight: 600;
      color: var(--anarchy-gold);
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    /* Size variants */
    .school-logo.small .school-logo-img,
    .school-logo.small .fallback-logo {
      max-width: 80px;
      max-height: 80px;
    }

    .school-logo.small .fallback-shield {
      width: 60px;
      height: 60px;
    }

    .school-logo.small .fallback-text {
      font-size: 18px;
    }

    .school-logo.small .school-name-main {
      font-size: 16px;
    }

    .school-logo.small .school-name-sub {
      font-size: 10px;
    }

    .school-logo.large .school-logo-img,
    .school-logo.large .fallback-logo {
      max-width: 160px;
      max-height: 160px;
    }

    .school-logo.large .fallback-shield {
      width: 100px;
      height: 100px;
    }

    .school-logo.large .fallback-text {
      font-size: 32px;
    }

    .school-logo.large .school-name-main {
      font-size: 28px;
    }

    .school-logo.large .school-name-sub {
      font-size: 16px;
    }

    /* Animation for logo */
    .school-logo-img,
    .fallback-logo {
      transition: transform 0.3s ease;
    }

    .school-logo:hover .school-logo-img,
    .school-logo:hover .fallback-logo {
      transform: scale(1.05);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .school-logo-img,
      .fallback-logo {
        max-width: 100px;
        max-height: 100px;
      }
      
      .fallback-shield {
        width: 70px;
        height: 70px;
      }
      
      .fallback-text {
        font-size: 20px;
      }
      
      .school-name-main {
        font-size: 18px;
      }
      
      .school-name-sub {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .school-logo-img,
      .fallback-logo {
        max-width: 80px;
        max-height: 80px;
      }
      
      .fallback-shield {
        width: 60px;
        height: 60px;
      }
      
      .fallback-text {
        font-size: 18px;
      }
      
      .school-name-main {
        font-size: 16px;
      }
      
      .school-name-sub {
        font-size: 10px;
      }
    }
  `]
})
export class SchoolLogoComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}