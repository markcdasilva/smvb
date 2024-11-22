declare global {
    interface Window {
      _learnq: any[];
      gtag: (...args: any[]) => void;
    }
  }
  
  export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    try {
      // Google Analytics tracking
      window.gtag?.('event', eventName, {
        ...properties,
        event_category: 'Form',
        non_interaction: false,
      });
  
      // Klaviyo tracking
      if (window._learnq) {
        window._learnq.push(['track', eventName, properties]);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };
  
  export const trackFormStep = (step: number, data: Record<string, any> = {}) => {
    const stepName = `Form Step ${step}`;
    trackEvent(stepName, {
      step_number: step,
      ...data
    });
  };
  
  export const trackFormCompletion = (data: Record<string, any>) => {
    trackEvent('Form Completed', data);
    
    // Identify user in Klaviyo if we have their email
    if (data.email && window._learnq) {
      window._learnq.push(['identify', {
        $email: data.email,
        $first_name: data.contact_person?.split(' ')[0],
        $last_name: data.contact_person?.split(' ').slice(1).join(' '),
        company: data.company_name,
        cvr: data.cvr,
        employees: data.employees
      }]);
    }
  };