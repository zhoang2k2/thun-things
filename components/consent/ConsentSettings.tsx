'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';

import { useConsent } from '@/components/consent/ConsentProvider';
import { choiceClasses } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

// Native modal <dialog>: the browser traps focus and turns Escape into a `cancel` event. Mounted
// only while open, so the Analytics checkbox always starts from the stored choice.
const SettingsDialog = () => {
  const t = useTranslations('consent');
  const { analytics, save, closeSettings } = useConsent();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const checkboxId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save(data.get('analytics') === 'on');
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        closeSettings();
      }}
      className="ConsentSettings bg-canvas text-ink border-ink m-auto w-[calc(100%-2rem)] max-w-lg border p-0 backdrop:bg-[rgb(17_17_17/0.4)]"
    >
      <form onSubmit={onSubmit} className="ConsentSettings__form flex flex-col gap-6 p-6">
        <h2 id={titleId} className="ConsentSettings__title text-2xl leading-8 font-bold">
          {t('settingsTitle')}
        </h2>
        <p className="text-ink-muted text-sm leading-6">{t('settingsIntro')}</p>

        <div className="ConsentSettings__category border-line flex items-start justify-between gap-4 border-t pt-4">
          <div>
            <p className="font-medium">{t('necessaryTitle')}</p>
            <p className="text-ink-muted text-sm leading-6">{t('necessaryBody')}</p>
          </div>
          <span className="text-ink-muted shrink-0 text-xs tracking-wide uppercase">
            {t('alwaysOn')}
          </span>
        </div>

        <div className="ConsentSettings__category border-line flex items-start justify-between gap-4 border-t pt-4">
          <div>
            <label htmlFor={checkboxId} className="font-medium">
              {t('analyticsTitle')}
            </label>
            <p className="text-ink-muted text-sm leading-6">{t('analyticsBody')}</p>
          </div>
          <input
            type="checkbox"
            id={checkboxId}
            name="analytics"
            defaultChecked={analytics}
            className={cn(choiceClasses, 'checked:bg-ink mt-1')}
          />
        </div>

        <div className="ConsentSettings__actions flex flex-wrap gap-2">
          <Button type="submit" size="md">
            {t('save')}
          </Button>
          <Button size="md" variant="secondary" onClick={closeSettings}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </dialog>
  );
};

export const ConsentSettings = () => {
  const { settingsOpen } = useConsent();
  return settingsOpen ? <SettingsDialog /> : null;
};
