
import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12 bg-white shadow-sm border border-slate-200 my-8 rounded-3xl">
      <header className="border-b pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white text-xl">H</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Hintro Engineering Spec</h1>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          Comprehensive documentation for the Hintro Real-Time Task Collaboration Platform, addressing all requirements from the Full Stack Engineer Interview Assignment.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">1. Frontend Architecture</h2>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-700 leading-relaxed">
            Built as a modern <strong>Single Page Application (SPA)</strong> using <strong>React 18</strong>. The architecture follows a modular component-based pattern with a focus on performant re-renders during high-frequency real-time updates.
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li><strong>State Management:</strong> Centralized data flow using custom React Hooks and a singleton API service layer.</li>
            <li><strong>Styling:</strong> Tailwind CSS for a utility-first, responsive, and maintainable design system.</li>
            <li><strong>Drag & Drop:</strong> Native HTML5 Drag and Drop API implementation optimized for list-to-list transitions.</li>
            <li><strong>Search:</strong> Client-side memoized search for instant task filtering.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">2. Backend & API Contract</h2>
        <div className="bg-slate-900 p-8 rounded-3xl text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`// API BASE URL: /api/v1
// All responses follow standard JSON format

GET /boards                      -> 200 OK | List of all accessible boards
POST /boards                     -> 201 Created | { title: string }
GET /boards/:id/tasks            -> 200 OK | Filtered tasks by board ID
POST /tasks                      -> 201 Created | { title, listId, boardId, priority }
PATCH /tasks/:id                 -> 200 OK | Updates { assigneeId, listId, status }
DELETE /tasks/:id                -> 204 No Content | Remove task
GET /activity?page=1&size=10    -> 200 OK | Paginated activity history

// Status Codes Used:
// 200: Success | 201: Resource Created | 400: Bad Request | 401: Unauthorized | 404: Not Found`}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">3. Real-Time Sync Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">Simulated WebSocket Layer</h3>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              We leverage the <strong>BroadcastChannel API</strong> to facilitate cross-tab synchronization. This provides a "Websocket-equivalent" local experience where actions in one tab immediately trigger state refreshes in all other open instances.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Production Upgrade Path</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              For production, this would be replaced by <strong>Socket.io</strong> or <strong>AWS AppSync (GraphQL Subscriptions)</strong>, ensuring global delivery via a pub/sub mechanism like Redis.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">4. Scalability Considerations</h2>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-bold text-slate-800">Database Indexing</h4>
              <p className="text-sm text-slate-500">Ensure composite indexes on <code>(board_id, list_id, order)</code> for tasks to support rapid reordering and retrieval as boards grow.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-bold text-slate-800">Caching Strategy</h4>
              <p className="text-sm text-slate-500">Implement Redis caching for high-frequency "Board Overview" queries and activity streams to reduce RDBMS load.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-bold text-slate-800">Micro-Frontend Readiness</h4>
              <p className="text-sm text-slate-500">The modular architecture allows the "Board" and "Dashboard" to be split into independent micro-apps if team size dictates vertical scaling.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">5. Test Coverage Strategy</h2>
        <p className="text-sm text-slate-600 italic">"The code is structured for high testability via dependency injection of the API service."</p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h5 className="font-bold text-xs uppercase text-slate-400 mb-2">Unit</h5>
            <p className="text-xs text-slate-600">Jest for pure business logic in MockBackend and data transformers.</p>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase text-slate-400 mb-2">Component</h5>
            <p className="text-xs text-slate-600">React Testing Library for UI interaction and state transitions.</p>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase text-slate-400 mb-2">E2E</h5>
            <p className="text-xs text-slate-600">Playwright for critical user paths: Auth -> Create Board -> Task Drag & Drop.</p>
          </div>
        </div>
      </section>
      
      <footer className="pt-12 border-t text-slate-400 text-xs flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
           <span>System Stable | Deployment Ready</span>
        </div>
        <span>Lead Architect: <strong>Sreesanth Osuri</strong></span>
      </footer>
    </div>
  );
};
