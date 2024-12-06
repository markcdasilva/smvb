interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
  }
  
  export class AnalyticsService {
    static trackEvent({ name, properties = {} }: AnalyticsEvent) {
      try {
        // Google Analytics tracking
        if (window.gtag) {
          window.gtag('event', name, {
            ...properties,
            event_category: 'Form',
            non_interaction: false,
          });
        }
  
        // Klaviyo tracking
        if (window._learnq) {
          window._learnq.push(['track', name, properties]);
        }
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    }
  
    static identifyUser(userData: {
      email: string;
      first_name?: string;
      last_name?: string;
      company?: string;
      cvr?: string;
      employees?: number;
    }) {
      if (!userData.email || !window._learnq) return;
  
      window._learnq.push(['identify', {
        $email: userData.email,
        $first_name: userData.first_name,
        $last_name: userData.last_name,
        company: userData.company,
        cvr: userData.cvr,
        employees: userData.employees
      }]);
    }
  }