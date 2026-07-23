import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

const DEFAULT_HERO = {
  badge: 'Rajalakshmi Engineering College',
  titleHighlight: 'AWS Student Builder Group',
  subtitle: 'A vibrant community of cloud enthusiasts, builders, and practitioners working together to build future-ready cloud skills.',
};

const DEFAULT_COORDINATOR = {
  name: 'Bhuvaneswaran B.',
  role: 'Asst. Professor (Senior Grade) & Training Manager',
  department: 'Dept. of CSE · Rajalakshmi Engineering College',
  image: '/images/faculty_bhuvaneswaran.jpg',
  bio: 'The driving force behind the AWS Student Builder Group at Rajalakshmi Engineering College, he has played a pivotal role in establishing and nurturing the community since its inception. By mentoring the core and crew teams, reviewing ideas, monitoring progress, providing valuable feedback, and ensuring the successful execution of every initiative, he has fostered a culture of innovation, collaboration, and continuous learning. Through his unwavering guidance and commitment to excellence, he empowers students to grow, lead impactful initiatives, and contribute to the sustained success of the AWS Student Builder Group.',
  linkedin: 'https://www.linkedin.com/in/bhuvaneswaranrec/',
};

const DEFAULT_JOURNEYS = [
  {
    label: 'Cloud Matrix',
    sublabel: 'Cloud Computing Session · 2025',
    image: '/images/cloud_jam.jpg',
    description: 'CLOUD MATRIX was an engaging cloud computing awareness session organized by AWS Cloud Club REC. The event introduced participants to cloud fundamentals, career opportunities, and industry-recognized certifications through practical insights shared by a DevOps professional. The session concluded with an interactive live quiz, making learning both informative and enjoyable.',
    gradient: 'linear-gradient(135deg,rgb(130,68,239),#4a7a9b)',
    order: 0,
  },
  {
    label: 'AI Workshop',
    sublabel: 'Bedrock & LLMs · Feb 2026',
    image: '/images/ai_workshop.jpg',
    description: 'A comprehensive generative AI hands-on session focusing on Amazon Bedrock. Students explored building applications using large language models (LLMs), prompt engineering, and building agentic assistants.',
    gradient: 'linear-gradient(135deg,#0073BB,#005f9e)',
    order: 1,
  },
  {
    label: 'AWS Student Community Day',
    sublabel: 'Community Event · SJIT',
    image: '/images/community_meetup.jpg',
    description: "AWS Student Community Day at St. Joseph's Institute of Technology was a community-driven event that brought together students, AWS experts, and cloud enthusiasts. The event featured insightful technical sessions, real-world AWS use cases, networking opportunities, and hands-on learning, enabling participants to enhance their cloud knowledge and connect with the AWS community.",
    gradient: 'linear-gradient(135deg,#FF9900,#E68900)',
    order: 2,
  },
  {
    label: 'Certification Bootcamp',
    sublabel: '100+ students certified',
    image: '/images/bootcamp.jpg',
    description: 'A focused interactive workspace session where students collaborated on preparation for AWS certifications, shared learnings from technical bootcamps, and engaged in peer mentoring.',
    gradient: 'linear-gradient(135deg,#2c4a62,#3d6680)',
    order: 3,
  },
  {
    label: 're:Invent Watch Party',
    sublabel: 'Cloud Matrix Event',
    image: '/images/ai_workshop.jpg',
    description: 'An expert panel discussion and watch party highlighting the most exciting announcements and technical breakthroughs from AWS re:Invent, sharing actionable insights for developers.',
    gradient: 'linear-gradient(135deg,#005f9e,#0073BB)',
    order: 4,
  },
  {
    label: 'ROBO WOLKE – From Pixels to Motion',
    sublabel: 'Robotics & Cloud Workshop',
    image: '/images/robo_wolke_journey.jpg',
    description: 'ROBO WOLKE – From Pixels to Motion is a hands-on technical workshop jointly organized by The Robotics Society and AWS Cloud Club REC. The session introduces participants to computer vision, motion planning, inverse kinematics, and intelligent cloud-powered robotics through live demonstrations and practical learning experiences.',
    gradient: 'linear-gradient(135deg,#243448,#2d4f6b)',
    order: 5,
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
  { name: 'Giridharan R', role: 'IT Support and Management', department: 'AWS Cloud Clubs REC', image: '/images/core/giridharan_r.jpg', accent: '#0073BB', type: 'core', order: 0 },
  { name: 'Dilip Kannan K', role: 'Event Management', department: 'AWS Cloud Clubs REC', image: '/images/core/dilip_kannan.jpg', accent: '#7C3AED', type: 'core', order: 1 },
  { name: 'Prathakshanaa T', role: 'Captain', department: 'AWS Cloud Clubs REC', image: '/images/core/prathakshanaa_t.jpg', accent: '#E68A00', type: 'core', order: 2 },
  { name: 'K N Pranav Ranjan', role: 'Tech Lead', department: 'AWS Cloud Clubs REC', image: '/images/core/pranav_ranjan.jpg', accent: '#E68A00', type: 'core', order: 3 },
  { name: 'V Thirunavukkarasu', role: 'Social Media Lead', department: 'AWS Cloud Clubs REC', image: '/images/core/thirunavukkarasu.jpg', accent: '#16A34A', type: 'core', order: 4 },
  // CREW
  { name: 'Abimithren', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/abimithren.jpg', accent: '#0073BB', type: 'crew', order: 5 },
  { name: 'Abhijith K', role: 'Technical Associate', department: 'Projects & Innovation', image: '/images/crew/abhijith_k.jpg', accent: '#E68A00', type: 'crew', order: 6 },
  { name: 'Balaambiga C A', role: 'Operations Lead', department: 'Events & Outreach', image: '/images/crew/balaambiga_c_a.jpg', accent: '#16A34A', type: 'crew', order: 7 },
  { name: 'Goutham R', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/goutham_r.jpg', accent: '#0073BB', type: 'crew', order: 8 },
  { name: 'Harini S', role: 'Events Associate', department: 'Events & Outreach', image: '/images/crew/harini_s.jpg', accent: '#7C3AED', type: 'crew', order: 9 },
  { name: 'Jaiganesh G', role: 'Marketing Associate', department: 'Marketing & Media', image: '/images/crew/jaiganesh_g.jpg', accent: '#E68A00', type: 'crew', order: 10 },
  { name: 'Lakshminarasimhan', role: 'Technical Associate', department: 'Projects & Innovation', image: '/images/crew/lakshminarasimhan.jpg', accent: '#0073BB', type: 'crew', order: 11 },
  { name: 'Neil Daniel', role: 'Content Strategist', department: 'Marketing & Media', image: '/images/crew/neil_daniel.jpg', accent: '#7C3AED', type: 'crew', order: 12 },
  { name: 'Rannesh Khumar B R', role: 'Web Developer', department: 'Projects & Innovation', image: '/images/crew/rannesh_khumar_b_r.jpg', accent: '#E68A00', type: 'crew', order: 13 },
  { name: 'Sam Devaraja J', role: 'Lead Developer', department: 'Projects & Innovation', image: '/images/crew/sam_devaraja_j.jpg', accent: '#0073BB', type: 'crew', order: 14 },
  { name: 'Sudhish', role: 'Events Associate', department: 'Events & Outreach', image: '/images/crew/sudhish.jpg', accent: '#16A34A', type: 'crew', order: 15 },
  { name: 'Sunchitha V K', role: 'Design Lead', department: 'Marketing & Media', image: '/images/crew/sunchitha_vk.jpg', accent: '#E68A00', type: 'crew', order: 16 },
  { name: 'Vs Thamizh Selvan', role: 'Cloud Associate', department: 'Projects & Innovation', image: '/images/crew/vs_thamizh_selvan.jpg', accent: '#0073BB', type: 'crew', order: 17 },
];

@Injectable()
export class HomepageService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureSeeded();
    } catch (error: any) {
      console.warn('Failed to auto-seed homepage data during initialization (tables may not exist yet):', error?.message || error);
    }
  }

  async ensureSeeded() {
    // 1. Hero
    const heroCount = await this.prisma.homepageHero.count();
    if (heroCount === 0) {
      await this.prisma.homepageHero.create({ data: DEFAULT_HERO });
    }

    // 2. Coordinator
    const coordCount = await this.prisma.homepageCoordinator.count();
    if (coordCount === 0) {
      await this.prisma.homepageCoordinator.create({ data: DEFAULT_COORDINATOR });
    }

    // 3. Journeys
    const journeyCount = await this.prisma.homepageJourney.count();
    if (journeyCount === 0) {
      for (const item of DEFAULT_JOURNEYS) {
        await this.prisma.homepageJourney.create({ data: item });
      }
    }

    // 4. Testimonials
    const testCount = await this.prisma.homepageTestimonial.count();
    if (testCount === 0) {
      for (const item of DEFAULT_TESTIMONIALS) {
        await this.prisma.homepageTestimonial.create({ data: item });
      }
    }

    // 5. Team
    const teamCount = await this.prisma.homepageTeam.count();
    if (teamCount === 0) {
      for (const item of DEFAULT_TEAM) {
        await this.prisma.homepageTeam.create({ data: item });
      }
    }
  }

  // ── Hero ─────────────────────────────────────────────────────────────────
  async getHero() {
    const hero = await this.prisma.homepageHero.findFirst();
    if (!hero) {
      return this.prisma.homepageHero.create({ data: DEFAULT_HERO });
    }
    return hero;
  }

  async updateHero(dto: { badge: string; titleHighlight: string; subtitle: string }) {
    const hero = await this.getHero();
    return this.prisma.homepageHero.update({
      where: { id: hero.id },
      data: dto,
    });
  }

  // ── Coordinator ──────────────────────────────────────────────────────────
  async getCoordinator() {
    const coord = await this.prisma.homepageCoordinator.findFirst();
    if (!coord) {
      return this.prisma.homepageCoordinator.create({ data: DEFAULT_COORDINATOR });
    }
    return coord;
  }

  async updateCoordinator(dto: { name: string; role: string; department: string; image: string; bio: string; linkedin: string }) {
    const coord = await this.getCoordinator();
    return this.prisma.homepageCoordinator.update({
      where: { id: coord.id },
      data: dto,
    });
  }

  // ── Journeys ─────────────────────────────────────────────────────────────
  async getJourneys() {
    return this.prisma.homepageJourney.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createJourney(dto: { label: string; sublabel: string; image: string; description: string; gradient: string; order?: number }) {
    return this.prisma.homepageJourney.create({
      data: dto,
    });
  }

  async updateJourney(id: string, dto: { label: string; sublabel: string; image: string; description: string; gradient: string; order?: number }) {
    return this.prisma.homepageJourney.update({
      where: { id },
      data: dto,
    });
  }

  async deleteJourney(id: string) {
    return this.prisma.homepageJourney.delete({
      where: { id },
    });
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  async getTestimonials() {
    return this.prisma.homepageTestimonial.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createTestimonial(dto: { name: string; role: string; rating: number; text: string; type: string; order?: number }) {
    return this.prisma.homepageTestimonial.create({
      data: dto,
    });
  }

  async updateTestimonial(id: string, dto: { name: string; role: string; rating: number; text: string; type: string; order?: number }) {
    return this.prisma.homepageTestimonial.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTestimonial(id: string) {
    return this.prisma.homepageTestimonial.delete({
      where: { id },
    });
  }

  // ── Team ─────────────────────────────────────────────────────────────────
  async getTeam() {
    return this.prisma.homepageTeam.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createTeamMember(dto: { name: string; role: string; department: string; image: string; accent: string; type: string; order?: number }) {
    return this.prisma.homepageTeam.create({
      data: dto,
    });
  }

  async updateTeamMember(id: string, dto: { name: string; role: string; department: string; image: string; accent: string; type: string; order?: number }) {
    return this.prisma.homepageTeam.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTeamMember(id: string) {
    return this.prisma.homepageTeam.delete({
      where: { id },
    });
  }
}
