import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { MemoryCacheService } from '@/shared/cache/memory-cache.service';

const DEFAULT_HERO = {
  badge: 'Rajalakshmi Engineering College',
  titleHighlight: 'AWS Student Builder Group',
  subtitle: 'A vibrant community of cloud enthusiasts, builders, and practitioners working together to build future-ready cloud skills.',
};

const DEFAULT_COORDINATOR = {
  name: 'Mr. Bhuvaneswaran B',
  role: 'Asst. Professor (Senior Grade) & Training Manager',
  department: 'Dept. of CSE · Rajalakshmi Engineering College',
  image: '/images/faculty_bhuvaneswaran.jpg',
  bio: 'The driving force behind the AWS Student Builder Group at Rajalakshmi Engineering College, he has played a pivotal role in establishing and nurturing the community since its inception. By mentoring the core and crew teams, reviewing ideas, monitoring progress, providing valuable feedback, and ensuring the successful execution of every initiative, he has fostered a culture of innovation, collaboration, and continuous learning. Through his unwavering guidance and commitment to excellence, he empowers students to grow, lead impactful initiatives, and contribute to the sustained success of the AWS Student Builder Group.',
  linkedin: 'https://www.linkedin.com/in/bhuvaneswaranrec/',
};

const DEFAULT_JOURNEYS = [
  {
    label: 'St. Joseph Student Community Day',
    sublabel: 'Interactive Community Meetup',
    image: '/images/community_meetup.jpg',
    description: 'A dynamic student meetup bringing together diverse tracks and inspiring speakers from different domains. Each track features insightful sessions led by speakers with expertise in their respective fields, giving students the opportunity to explore new domains, gain valuable perspectives, and connect with a wider student community.',
    gradient: 'linear-gradient(135deg,#FF9900,#E68900)',
    order: 0,
  },
  {
    label: 'RoboWolke – From Pixels to Motion',
    sublabel: 'Robotics & Cloud Intelligence',
    image: '/images/robo_wolke_journey.jpg',
    description: 'Where robotics meets cloud intelligence. RoboWolke explores how machines see, analyze, and act in real time through Computer Vision, cloud integration, and data-driven automation.',
    gradient: 'linear-gradient(135deg,#243448,#2d4f6b)',
    order: 1,
  },
  {
    label: 'Cloud Matrix',
    sublabel: 'Cloud Computing Fundamentals',
    image: '/images/cloud_jam.jpg',
    description: 'An engaging introduction to the world of cloud computing, covering its fundamentals, diverse career paths, and industry-relevant certifications. The session concludes with an interactive quiz, putting participants’ cloud knowledge to the test.',
    gradient: 'linear-gradient(135deg,rgb(130,68,239),#4a7a9b)',
    order: 2,
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Shruti K',
    role: '2nd Year · CSE Department',
    rating: 5,
    text: 'The Cloud Matrix session was informative and interesting. The quiz part was really challenging and engaging. I gained a lot of valuable information about cloud computing and its applications. Overall, it was a great learning experience.',
    type: 'Cloud Computing',
    order: 0,
  },
  {
    name: 'Shanthosh Sivan E',
    role: '2nd Year · CSE Department',
    rating: 5,
    text: 'The session was highly interactive and provided me with new insights regarding my career paths in the cloud domain. The quiz was fun, competitive, and kept everyone engaged throughout. Overall, the experience was truly useful and informative.',
    type: 'Career Insights',
    order: 1,
  },
  {
    name: 'Sachin Saravanan',
    role: '2nd Year · CSE Department',
    rating: 5,
    text: 'The session went in-depth into cloud computing and helped me understand how platforms like Netflix and other websites leverage cloud technologies to operate efficiently. It was an insightful session that gave me a better understanding of real-world cloud applications.',
    type: 'Real-World Cloud',
    order: 2,
  },
  {
    name: 'Pooja',
    role: '1st Year · CSE Department',
    rating: 5,
    text: 'Robowolke was a truly engaging and insightful experience. I got hands-on experience working with robotics concepts and learned how robots learn, think, act, and make decisions based on the data they receive.',
    type: 'Robotics',
    order: 3,
  },
  {
    name: 'Devadarshini',
    role: '2nd Year · CSE Department',
    rating: 5,
    text: 'Robowolke provided a great blend of learning and hands-on practice. It sparked my interest in robotics and intelligent systems.',
    type: 'Intelligent Systems',
    order: 4,
  },
];

const DEFAULT_TEAM = [
  // CORE
  { name: 'V Thirunavukkarasu', role: 'Social Media Lead', department: 'AWS Cloud Clubs REC', image: '/images/core/thirunavukkarasu.jpg', accent: '#FF9900', type: 'core', order: 0 },
  { name: 'Prathakshanaa T', role: 'Captain', department: 'AWS Cloud Clubs REC', image: '/images/core/prathakshanaa_t.jpg', accent: '#E68A00', type: 'core', order: 1 },
  { name: 'K N Pranav Ranjan', role: 'Tech Lead', department: 'AWS Cloud Clubs REC', image: '/images/core/pranav_ranjan.jpg', accent: '#E68A00', type: 'core', order: 2 },
  // CREW (alphabetical)
  { name: 'Abimithren', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/abimithren.jpg', accent: '#0073BB', type: 'crew', order: 3 },
  { name: 'Balaambiga C A', role: 'Operations Lead', department: 'Events & Outreach', image: '/images/crew/balaambiga_c_a.jpg', accent: '#16A34A', type: 'crew', order: 4 },
  { name: 'Goutham R', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/goutham_r.jpg', accent: '#0073BB', type: 'crew', order: 5 },
  { name: 'Harini S', role: 'Events Associate', department: 'Events & Outreach', image: '/images/crew/harini_s.jpg', accent: '#7C3AED', type: 'crew', order: 6 },
  { name: 'Jaiganesh G', role: 'Marketing Associate', department: 'Marketing & Media', image: '/images/crew/jaiganesh_g.jpg', accent: '#E68A00', type: 'crew', order: 7 },
  { name: 'Lakshminarasimhan Uppili', role: 'Events Associate', department: 'Events & Outreach', image: '/images/crew/lakshminarasimhan_uppili.jpg', accent: '#0073BB', type: 'crew', order: 8 },
  { name: 'Neil Daniel', role: 'Content Strategist', department: 'Marketing & Media', image: '/images/crew/neil_daniel.jpg', accent: '#7C3AED', type: 'crew', order: 9 },
  { name: 'Rannesh Khumar B R', role: 'Web Developer', department: 'Projects & Innovation', image: '/images/crew/rannesh_khumar_b_r.jpg', accent: '#E68A00', type: 'crew', order: 9 },
  { name: 'Sam Devaraja J', role: 'Lead Developer', department: 'Projects & Innovation', image: '/images/crew/sam_devaraja_j.jpg', accent: '#0073BB', type: 'crew', order: 10 },
  { name: 'Sudhish', role: 'Events Associate', department: 'Events & Outreach', image: '/images/crew/sudhish.jpg', accent: '#16A34A', type: 'crew', order: 11 },
  { name: 'Sunchitha V K', role: 'Design Lead', department: 'Marketing & Media', image: '/images/crew/sunchitha_vk.jpg', accent: '#E68A00', type: 'crew', order: 12 },
  { name: 'Vs Thamizh Selvan', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/vs_thamizh_selvan.jpg', accent: '#0073BB', type: 'crew', order: 13 },
];

@Injectable()
export class HomepageService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: MemoryCacheService,
  ) {}

  private get heroModel() {
    return (this.prisma as any).homepageHero || (this.prisma as any).homepage_hero;
  }

  private get coordModel() {
    return (this.prisma as any).homepageCoordinator || (this.prisma as any).homepage_coordinator;
  }

  private get journeyModel() {
    return (this.prisma as any).homepageJourney || (this.prisma as any).homepage_journeys;
  }

  private get testimonialModel() {
    return (this.prisma as any).homepageTestimonial || (this.prisma as any).homepage_testimonials;
  }

  private get teamModel() {
    return (this.prisma as any).homepageTeam || (this.prisma as any).homepage_team;
  }

  async onModuleInit() {
    try {
      await this.ensureSeeded();
    } catch (error: any) {
      console.warn('Failed to auto-seed homepage data during initialization:', error?.message || error);
    }
  }

  async ensureSeeded() {
    try {
      if (this.heroModel) {
        const heroCount = await this.heroModel.count();
        if (heroCount === 0) {
          await this.heroModel.create({ data: DEFAULT_HERO });
        }
      }

      if (this.coordModel) {
        const coordCount = await this.coordModel.count();
        if (coordCount === 0) {
          await this.coordModel.create({ data: DEFAULT_COORDINATOR });
        }
      }

      if (this.journeyModel) {
        const journeyCount = await this.journeyModel.count();
        if (journeyCount === 0) {
          for (const item of DEFAULT_JOURNEYS) {
            await this.journeyModel.create({ data: item });
          }
        }
      }

      if (this.testimonialModel) {
        const testCount = await this.testimonialModel.count();
        if (testCount === 0) {
          for (const item of DEFAULT_TESTIMONIALS) {
            await this.testimonialModel.create({ data: item });
          }
        }
      }

      if (this.teamModel) {
        const teamCount = await this.teamModel.count();
        if (teamCount === 0) {
          for (const item of DEFAULT_TEAM) {
            await this.teamModel.create({ data: item });
          }
        }
      }
    } catch (err: any) {
      console.warn('Auto-seed notice:', err?.message || err);
    }
  }

  // ── Hero ─────────────────────────────────────────────────────────────────
  async getHero() {
    return this.cache.getOrSet('homepage:hero', async () => {
      try {
        if (this.heroModel) {
          const hero = await this.heroModel.findFirst();
          if (hero) return hero;
          return await this.heroModel.create({ data: DEFAULT_HERO });
        }
      } catch (e) {
        console.warn('getHero db query fallback:', e);
      }
      return DEFAULT_HERO;
    }, 300);
  }

  async updateHero(dto: { badge: string; titleHighlight: string; subtitle: string }) {
    this.cache.del('homepage:hero');
    if (!this.heroModel) return DEFAULT_HERO;
    const hero = await this.getHero();
    if ((hero as any).id) {
      return this.heroModel.update({
        where: { id: (hero as any).id },
        data: dto,
      });
    }
    return this.heroModel.create({ data: dto });
  }

  // ── Coordinator ──────────────────────────────────────────────────────────
  async getCoordinator() {
    return this.cache.getOrSet('homepage:coordinator', async () => {
      try {
        if (this.coordModel) {
          const coord = await this.coordModel.findFirst();
          if (coord) return coord;
          return await this.coordModel.create({ data: DEFAULT_COORDINATOR });
        }
      } catch (e) {
        console.warn('getCoordinator db query fallback:', e);
      }
      return DEFAULT_COORDINATOR;
    }, 300);
  }

  async updateCoordinator(dto: { name: string; role: string; department: string; image: string; bio: string; linkedin: string }) {
    this.cache.del('homepage:coordinator');
    if (!this.coordModel) return DEFAULT_COORDINATOR;
    const coord = await this.getCoordinator();
    if ((coord as any).id) {
      return this.coordModel.update({
        where: { id: (coord as any).id },
        data: dto,
      });
    }
    return this.coordModel.create({ data: dto });
  }

  // ── Journeys ─────────────────────────────────────────────────────────────
  async getJourneys() {
    return this.cache.getOrSet('homepage:journeys', async () => {
      try {
        if (this.journeyModel) {
          const items = await this.journeyModel.findMany({
            orderBy: { order: 'asc' },
          });
          if (items && items.length > 0) return items;
        }
      } catch (e) {
        console.warn('getJourneys db query fallback:', e);
      }
      return DEFAULT_JOURNEYS;
    }, 300);
  }

  async createJourney(dto: { label: string; sublabel: string; image: string; description: string; gradient: string; order?: number }) {
    this.cache.del('homepage:journeys');
    if (!this.journeyModel) return { id: Date.now().toString(), ...dto };
    return this.journeyModel.create({
      data: dto,
    });
  }

  async updateJourney(id: string, dto: { label: string; sublabel: string; image: string; description: string; gradient: string; order?: number }) {
    this.cache.del('homepage:journeys');
    if (!this.journeyModel) return { id, ...dto };
    return this.journeyModel.update({
      where: { id },
      data: dto,
    });
  }

  async deleteJourney(id: string) {
    this.cache.del('homepage:journeys');
    if (!this.journeyModel) return { id };
    return this.journeyModel.delete({
      where: { id },
    });
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  async getTestimonials() {
    return this.cache.getOrSet('homepage:testimonials', async () => {
      try {
        if (this.testimonialModel) {
          const items = await this.testimonialModel.findMany({
            orderBy: { order: 'asc' },
          });
          if (items && items.length > 0) return items;
        }
      } catch (e) {
        console.warn('getTestimonials db query fallback:', e);
      }
      return DEFAULT_TESTIMONIALS;
    }, 300);
  }

  async createTestimonial(dto: { name: string; role: string; rating: number; text: string; type: string; order?: number }) {
    this.cache.del('homepage:testimonials');
    if (!this.testimonialModel) return { id: Date.now().toString(), ...dto };
    return this.testimonialModel.create({
      data: dto,
    });
  }

  async updateTestimonial(id: string, dto: { name: string; role: string; rating: number; text: string; type: string; order?: number }) {
    this.cache.del('homepage:testimonials');
    if (!this.testimonialModel) return { id, ...dto };
    return this.testimonialModel.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTestimonial(id: string) {
    this.cache.del('homepage:testimonials');
    if (!this.testimonialModel) return { id };
    return this.testimonialModel.delete({
      where: { id },
    });
  }

  // ── Team ─────────────────────────────────────────────────────────────────
  async getTeam() {
    return this.cache.getOrSet('homepage:team', async () => {
      try {
        if (this.teamModel) {
          const items = await this.teamModel.findMany({
            orderBy: { order: 'asc' },
          });
          if (items && items.length > 0) return items;
        }
      } catch (e) {
        console.warn('getTeam db query fallback:', e);
      }
      return DEFAULT_TEAM;
    }, 300);
  }

  async createTeamMember(dto: { name: string; role: string; department: string; image: string; accent: string; type: string; order?: number }) {
    this.cache.del('homepage:team');
    if (!this.teamModel) return { id: Date.now().toString(), ...dto };
    return this.teamModel.create({
      data: dto,
    });
  }

  async updateTeamMember(id: string, dto: { name: string; role: string; department: string; image: string; accent: string; type: string; order?: number }) {
    this.cache.del('homepage:team');
    if (!this.teamModel) return { id, ...dto };
    return this.teamModel.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTeamMember(id: string) {
    this.cache.del('homepage:team');
    if (!this.teamModel) return { id };
    return this.teamModel.delete({
      where: { id },
    });
  }
}

