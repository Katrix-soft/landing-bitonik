import { Component, signal, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('bitonik-landing');

  // Countdown Timer
  protected countdownText = signal('00:00:00');
  private timerId: any;

  // Modals Visibility
  protected showJoinModal = signal(false);
  protected showProfileModal = signal(false);
  protected registrationSuccess = signal(false);

  // Active Navigation Tracking
  protected activeSection = signal('home');

  // Form Group
  protected joinForm!: FormGroup;

  // Selected Plan for form
  protected selectedPlanName = signal('Pase Libre');

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
    this.startCountdown();
    this.initIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private initForm() {
    this.joinForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s+-]{8,15}$/)]],
      plan: ['Pase Libre', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  private startCountdown() {
    const updateTimer = () => {
      const now = new Date();
      // target is midnight of the current day
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        this.countdownText.set('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num: number) => num.toString().padStart(2, '0');
      this.countdownText.set(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    this.timerId = setInterval(updateTimer, 1000);
  }

  private initIntersectionObserver() {
    if (typeof window === 'undefined') return;

    // Use a small delay to make sure elements are rendered
    setTimeout(() => {
      const sections = ['home', 'features', 'plans'];
      const options = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // trigger when section occupies main part of viewport
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        });
      }, options);

      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);
  }

  // Scroll methods
  protected scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection.set(sectionId);
    }
  }

  protected scrollLeft() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: -350, behavior: 'smooth' });
    }
  }

  protected scrollRight() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: 350, behavior: 'smooth' });
    }
  }

  // Modal Handlers
  protected openJoinModal(planName: string = 'Pase Libre') {
    this.selectedPlanName.set(planName);
    this.joinForm.patchValue({ plan: planName });
    this.registrationSuccess.set(false);
    this.showJoinModal.set(true);
    this.showProfileModal.set(false);
  }

  protected closeJoinModal() {
    this.showJoinModal.set(false);
    this.joinForm.reset({ plan: 'Pase Libre', terms: false });
  }

  protected openProfileModal() {
    this.showProfileModal.set(true);
    this.showJoinModal.set(false);
  }

  protected closeProfileModal() {
    this.showProfileModal.set(false);
  }

  protected onSubmitJoin() {
    if (this.joinForm.valid) {
      // Simulate API submit
      console.log('Registering user:', this.joinForm.value);
      this.registrationSuccess.set(true);
      setTimeout(() => {
        this.closeJoinModal();
        this.registrationSuccess.set(false);
      }, 3000);
    } else {
      // Mark all as touched to display validation errors
      this.joinForm.markAllAsTouched();
    }
  }
}

