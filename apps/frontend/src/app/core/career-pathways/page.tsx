"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { careerPathwaysService } from "@/services/career-pathways";
import { CareerRoleFormDialog } from "@/components/career-pathways/career-role-form-dialog";
import { PathwayCard } from "@/components/career-pathways/pathway-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  GraduationCap,
  BriefcaseBusiness,
  Plus,
  Route,
} from "lucide-react";
import { toast } from "sonner";
import { CareerRoleListItem } from "@/lib/types";

function CoreCareerPathwaysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [addPathOpen, setAddPathOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setAddPathOpen(true);
    }
  }, [searchParams]);

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["admin-career-roles"],
    queryFn: careerPathwaysService.listRoles,
  });

  const createPathMutation = useMutation({
    mutationFn: (data: { name: string; description: string; slug?: string }) =>
      careerPathwaysService.createRole(data),
    onSuccess: (data: CareerRoleListItem) => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-roles"] });
      toast.success("Career role created successfully");
      setAddPathOpen(false);
      router.push(`/core/career-pathways/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create career role");
    },
  });

  return (
    <div 
      className="min-h-screen pb-20 antialiased"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '450px auto',
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:pt-12 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Header with Breadcrumb Path and Admin Buttons */}
        <header className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
              <span className="hover:text-[#FF9900] transition-colors font-semibold">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Core Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">Career Pathways</span>
            </div>
            
            <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              AWS Career Pathways
            </p>
            
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage career roles and build structured cloud certification pathways to guide learners towards high-demand industry jobs.
            </p>
          </div>

          {/* Custom Tab Switcher + Admin Actions */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-[6px] border border-slate-200">
              <Link
                href="/core/certifications"
                className="flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none text-slate-500 hover:text-slate-800 font-medium"
              >
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>AWS Certifications</span>
              </Link>
              
              <button
                type="button"
                className="flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all select-none bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80 cursor-default"
              >
                <BriefcaseBusiness className="h-4 w-4 text-[#FF9900]" />
                <span>Career Pathways</span>
              </button>
            </div>

            {/* Admin Add Pathway Button */}
            <Button 
              onClick={() => setAddPathOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
            >
              <Plus size={13} className="text-white" />
              Create Pathway
            </Button>
          </div>
        </header>

        {/* Admin Career Pathways Grid */}
        <div>
          {rolesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
              <p className="mt-4 text-sm text-muted-foreground">Loading career pathways...</p>
            </div>
          ) : rolesError ? (
            <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-3xl border border-red-100 bg-red-50/20 max-w-md mx-auto my-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <p className="text-sm font-semibold text-red-600">Failed to load career pathways. Please try again.</p>
            </div>
          ) : !roles?.length ? (
            <EmptyState
              icon={Route}
              title="No career pathways"
              description="Create your first career role to get started."
              action={
                <Button onClick={() => setAddPathOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm mt-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Pathway
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <PathwayCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CareerRoleFormDialog
        open={addPathOpen}
        onOpenChange={setAddPathOpen}
        onSubmit={(data) => createPathMutation.mutate(data)}
        isLoading={createPathMutation.isPending}
      />
    </div>
  );
}

export default function CoreCareerPathwaysPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading career pathways...</p>
      </div>
    }>
      <CoreCareerPathwaysContent />
    </Suspense>
  );
}
