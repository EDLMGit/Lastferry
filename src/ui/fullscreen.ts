type PolicyDocument = Document & {
  permissionsPolicy?: { allowsFeature(feature: string): boolean };
  featurePolicy?: { allowsFeature(feature: string): boolean };
};

type BuildIdentity = { artifact: string; mode: string };

type FullscreenAttempt = {
  id: number;
  intent: 'enter' | 'exit';
  trusted: boolean;
  outcome: 'pending' | 'entered' | 'exited' | 'unavailable' | 'rejected';
  before: ReturnType<FullscreenSupport['snapshot']>;
  after?: ReturnType<FullscreenSupport['snapshot']>;
  error?: { name: string; message: string };
  modal?: { frontBefore: boolean; frontAfter: boolean; focusRestored: boolean };
};

export class FullscreenSupport {
  promoting = false;
  private serial = 0;
  private attempts: FullscreenAttempt[] = [];
  private observations: { event: string; surface: ReturnType<FullscreenSupport['snapshot']> }[] =
    [];

  constructor(
    private root: HTMLElement,
    private dialog: HTMLDialogElement,
    private build: BuildIdentity,
  ) {}

  snapshot() {
    const policy = document as PolicyDocument;
    let allowed: boolean | null = null;
    try {
      allowed =
        (policy.permissionsPolicy ?? policy.featurePolicy)?.allowsFeature('fullscreen') ?? null;
    } catch {}
    const control = this.dialog.querySelector<HTMLElement>('#fullscreen, #cancel');
    const rect = control?.getBoundingClientRect();
    const hit = rect
      ? document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
      : null;
    return {
      time: performance.now(),
      api: typeof this.root.requestFullscreen === 'function',
      enabled: document.fullscreenEnabled,
      topLevel: window.self === window.top,
      policyAllows: allowed,
      secure: window.isSecureContext,
      activation: navigator.userActivation
        ? {
            active: navigator.userActivation.isActive,
            hasBeenActive: navigator.userActivation.hasBeenActive,
          }
        : null,
      element: document.fullscreenElement?.id ?? document.fullscreenElement?.tagName ?? null,
      viewport: {
        width: innerWidth,
        height: innerHeight,
        visualWidth: visualViewport?.width ?? null,
        visualHeight: visualViewport?.height ?? null,
        offsetLeft: visualViewport?.offsetLeft ?? null,
        offsetTop: visualViewport?.offsetTop ?? null,
      },
      app: this.root.getBoundingClientRect().toJSON(),
      dialog: {
        open: this.dialog.open,
        bounds: this.dialog.getBoundingClientRect().toJSON(),
        control: control?.id ?? null,
        front: !!control && !!hit && control.contains(hit),
      },
    };
  }

  observe(event: string) {
    const surface = this.snapshot();
    this.observations.push({ event, surface });
    this.observations = this.observations.slice(-8);
    const latest = this.attempts.at(-1);
    if (latest) latest.after = surface;
  }

  changed() {
    if (document.fullscreenElement === this.root && this.dialog.open) {
      const before = this.snapshot().dialog.front;
      const focused =
        document.activeElement instanceof HTMLElement &&
        this.dialog.contains(document.activeElement)
          ? document.activeElement
          : null;
      const scrollers = [this.dialog, ...this.dialog.querySelectorAll<HTMLElement>('*')].map(
        (element) => ({ element, top: element.scrollTop, left: element.scrollLeft }),
      );
      const returnValue = this.dialog.returnValue;
      this.promoting = true;
      try {
        this.dialog.close();
        this.dialog.showModal();
        this.dialog.returnValue = returnValue;
        focused?.focus({ preventScroll: true });
        for (const saved of scrollers) {
          saved.element.scrollTop = saved.top;
          saved.element.scrollLeft = saved.left;
        }
      } finally {
        this.promoting = false;
      }
      const latest = this.attempts.at(-1);
      if (latest)
        latest.modal = {
          frontBefore: before,
          frontAfter: this.snapshot().dialog.front,
          focusRestored: !focused || focused === document.activeElement,
        };
    }
    const latest = this.attempts.at(-1);
    if (latest && document.fullscreenElement === this.root) latest.outcome = 'entered';
    else if (latest && !document.fullscreenElement) latest.outcome = 'exited';
    this.observe('fullscreenchange');
  }

  toggle(trusted: boolean) {
    const before = this.snapshot();
    const attempt: FullscreenAttempt = {
      id: ++this.serial,
      intent: document.fullscreenElement ? 'exit' : 'enter',
      trusted,
      outcome: 'pending',
      before,
    };
    this.attempts.push(attempt);
    this.attempts = this.attempts.slice(-6);
    const reject = (error: unknown) => {
      attempt.outcome = 'rejected';
      attempt.error = {
        name: error instanceof Error ? error.name : 'Error',
        message: (error instanceof Error ? error.message : String(error)).slice(0, 512),
      };
      attempt.after = this.snapshot();
      return this.failureMessage(attempt);
    };
    try {
      if (attempt.intent === 'enter' && (!before.api || !before.enabled)) {
        attempt.outcome = 'unavailable';
        attempt.after = this.snapshot();
        return Promise.resolve(this.failureMessage(attempt));
      }
      const request =
        attempt.intent === 'exit' ? document.exitFullscreen() : this.root.requestFullscreen();
      return request.then(() => {
        attempt.after = this.snapshot();
        attempt.outcome = document.fullscreenElement === this.root ? 'entered' : 'exited';
        return null;
      }, reject);
    } catch (error) {
      return Promise.resolve(reject(error));
    }
  }

  private failureMessage(attempt: FullscreenAttempt) {
    if (attempt.intent === 'exit')
      return 'Could not exit fullscreen. You can use the browser’s fullscreen control.';
    if (!attempt.before.topLevel && attempt.before.policyAllows === false)
      return 'This embedded view blocks fullscreen. Open the game directly in your browser.';
    if (attempt.before.policyAllows === false)
      return 'This page blocks fullscreen. You can keep playing in the browser.';
    if (!attempt.before.api || !attempt.before.enabled)
      return 'Fullscreen is unavailable here. You can keep playing in the browser.';
    if (attempt.before.activation?.active === false)
      return 'Fullscreen needs a new tap. Try Fullscreen again.';
    return 'Fullscreen could not start. You can keep playing here or copy support details.';
  }

  get failed() {
    return ['unavailable', 'rejected'].includes(this.attempts.at(-1)?.outcome ?? '');
  }

  get currentId() {
    return this.serial;
  }

  details() {
    return structuredClone({
      schema: 1,
      build: this.build,
      userAgent: navigator.userAgent.slice(0, 320),
      latest: this.attempts.at(-1) ?? null,
      attempts: this.attempts,
      samples: this.observations,
      surface: this.snapshot(),
    });
  }
}
