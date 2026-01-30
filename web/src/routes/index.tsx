import {createFileRoute} from '@tanstack/react-router';
import {Avatar, AvatarFallback} from '../components/ui/avatar';
import {Badge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {Input} from '../components/ui/input';
import {Progress} from '../components/ui/progress';
import {Textarea} from '../components/ui/textarea';

const inProgress = [
  {
    title: 'Design UI ToDo App',
    description: 'Design a simple home pages with clean layout and colors.',
    date: 'Friday, 08 July 2022',
    progress: 78,
    badge: 'Personal',
  },
  {
    title: 'Wireframe website',
    description: 'Prepare initial wireframes for the marketing site.',
    date: 'Monday, 11 July 2022',
    progress: 54,
    badge: 'Team',
  },
];

const completed = [
  {
    title: 'Meeting with Client',
    description: 'Redesign motion graphic.',
    time: 'Today, 11:25 PM',
  },
  {
    title: 'Task Explore NFT',
    description: 'Explore design mobile UI.',
    time: '01 July, 10:30 AM',
  },
];

const timeline = [
  {time: '09:00 AM', title: 'Tournament Fortnite', progress: 70},
  {time: '11:00 AM', title: 'Design Web Flow', progress: 40},
  {time: '01:00 PM', title: 'Wireframe Surf App', progress: 87},
];

const dates = [
  {day: '08', label: 'Sat', active: true},
  {day: '09', label: 'Sun', active: false},
  {day: '10', label: 'Mon', active: false},
  {day: '11', label: 'Tue', active: false},
  {day: '12', label: 'Wed', active: false},
];

export const Route = createFileRoute('/')({
  component: () => (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>JH</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-slate-500">Hello,</p>
            <h1 className="text-xl font-semibold">Joko Husein</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full px-4 py-2">
            Calendar
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full px-4 py-2">
            Notifications
          </Button>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Card className="space-y-4">
            <CardHeader>
              <div>
                <CardTitle>On Progress</CardTitle>
                <CardDescription>12 tasks in progress</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500">
                View More
              </Button>
            </CardHeader>
            <div className="grid gap-4">
              {inProgress.map(task => (
                <div
                  key={task.title}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">{task.title}</h3>
                      <p className="text-xs text-slate-500">{task.date}</p>
                    </div>
                    <Badge variant="primary">{task.badge}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    {task.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Progress value={task.progress} />
                    <span className="text-xs font-semibold text-slate-500">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <CardHeader>
              <div>
                <CardTitle>Completed</CardTitle>
                <CardDescription>5 tasks done</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500">
                View More
              </Button>
            </CardHeader>
            <div className="grid gap-4">
              {completed.map(task => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5"
                >
                  <div>
                    <h3 className="text-base font-semibold">{task.title}</h3>
                    <p className="text-xs text-slate-500">{task.description}</p>
                    <p className="mt-2 text-xs text-slate-400">{task.time}</p>
                  </div>
                  <Badge variant="success">Done</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full rounded-[28px] py-4 text-base font-semibold">
                + Create New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new task</DialogTitle>
                <DialogDescription>
                  Plan your next task and keep momentum going.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 grid gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Title Task
                  </p>
                  <Input placeholder="Add task name..." />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Category
                  </p>
                  <div className="flex gap-2">
                    <Button variant="default" className="flex-1 rounded-2xl">
                      Personal
                    </Button>
                    <Button variant="secondary" className="flex-1 rounded-2xl">
                      Team
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Description
                  </p>
                  <Textarea placeholder="Add description..." />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="dd/mm/yy" />
                  <Input placeholder="hh:mm" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="ghost" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="space-y-5">
            <CardHeader>
              <div>
                <CardTitle>New Task ToDo</CardTitle>
                <CardDescription>Plan your next task</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Title Task
                </p>
                <Input placeholder="Add task name..." />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Category
                </p>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 rounded-2xl">
                    Personal
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-2xl">
                    Team
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Description
                </p>
                <Textarea placeholder="Add description..." />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="dd/mm/yy" />
                <Input placeholder="hh:mm" />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Create</Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <CardHeader>
              <div>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>08 July 2022</CardDescription>
              </div>
              <Badge>3 tasks today</Badge>
            </CardHeader>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {dates.map(date => (
                <div
                  key={date.day}
                  className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-3 text-sm font-semibold ${
                    date.active
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span>{date.day}</span>
                  <span className="text-xs font-normal">{date.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {timeline.map(item => (
                <div key={item.time} className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{item.time}</span>
                  <div className="flex-1 rounded-3xl bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <Progress value={item.progress} className="mt-2" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {item.progress}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  ),
});
