import { ArrowRight, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const jobs = [
  {
    id: 1,
    title: "General Manager",
    location: "Mumbai, India",
    department: "Management",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Executive Chef",
    location: "New Delhi, India",
    department: "Culinary",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Front Desk Associate",
    location: "Bengaluru, India",
    department: "Operations",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Marketing Manager",
    location: "Corporate - Mumbai",
    department: "Marketing",
    type: "Full-time",
  },
  {
    id: 5,
    title: "Spa Manager",
    location: "Udaipur, India",
    department: "Wellness",
    type: "Full-time",
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">

        {/* Hero */}
        <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <OptimizedImage
            {...siteContent.images.about.leadership}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl">
            <span className="inline-block px-4 py-1 border border-white/30 rounded-full text-sm font-medium tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
              Join Our Team
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6">
              Shape the Future of <span className="italic text-primary">Luxury</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Build a rewarding career with one of the world's most prestigious hospitality brands.
            </p>
          </div>
        </div>

        {/* Values */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <StarIcon />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">We strive for perfection in every detail.</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartIcon />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">Passion</h3>
                <p className="text-muted-foreground">Service comes from the heart, always.</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">Community</h3>
                <p className="text-muted-foreground">We grow together as one family.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-secondary/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-serif font-medium mb-4">Open Positions</h2>
                <p className="text-muted-foreground">Find your next role at Kennedia Blu.</p>
              </div>
              <button className="hidden md:flex items-center gap-2 text-primary font-bold">
                View All Roles <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="group bg-card hover:bg-white dark:hover:bg-card/80 border border-border p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer">
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                      <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                    <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">{job.type}</span>
                    <button className="ml-auto md:ml-0 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      Apply
                    </button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:opacity-0 transition-opacity absolute right-6 md:static" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

function StarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

function HeartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
}

function UsersIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
