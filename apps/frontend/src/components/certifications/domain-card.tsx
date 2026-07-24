"use client";

import { useState } from "react";
import { DomainListItem, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, BookOpen } from "lucide-react";
import { DomainFormDialog } from "./domain-form-dialog";
import { TopicFormDialog } from "./topic-form-dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";

const levelBadgeConfig: Record<string, { badgeClass: string; color: string }> = {
  Foundational: { 
    badgeClass: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/25 hover:bg-[#F1F5F9]",
    color: "#5A6572"
  },
  Associate: { 
    badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25 hover:bg-[#F0F7FF]",
    color: "#0972D3"
  },
  Professional: { 
    badgeClass: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/25 hover:bg-[#E6F8FA]",
    color: "#0083A0"
  },
  Specialty: { 
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25 hover:bg-[#F8F5FF]",
    color: "#5A30A6"
  }
};

interface DomainCardProps {
  domain: DomainListItem;
  certificationId: string;
  index: number;
  levelName?: string;
}

export function DomainCard({ domain, certificationId, index, levelName }: DomainCardProps) {
  const queryClient = useQueryClient();
  const [editDomainOpen, setEditDomainOpen] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteDomainConfirm, setDeleteDomainConfirm] = useState(false);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const updateDomainMutation = useMutation({
    mutationFn: (data: { name?: string; weightage?: number; displayOrder?: number }) =>
      certificationsService.updateDomain(domain.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Domain updated");
      setEditDomainOpen(false);
    },
    onError: () => toast.error("Failed to update domain"),
  });

  const deleteDomainMutation = useMutation({
    mutationFn: () => certificationsService.deleteDomain(domain.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Domain deleted");
      setDeleteDomainConfirm(false);
    },
    onError: () => toast.error("Failed to delete domain"),
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: { name: string; displayOrder: number }) =>
      certificationsService.createTopic(domain.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic added");
      setAddTopicOpen(false);
    },
    onError: () => toast.error("Failed to add topic"),
  });

  const updateTopicMutation = useMutation({
    mutationFn: (data: { name?: string; displayOrder?: number }) =>
      certificationsService.updateTopic(editTopic!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic updated");
      setEditTopic(null);
    },
    onError: () => toast.error("Failed to update topic"),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topicId: string) => certificationsService.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic deleted");
      setDeleteTopicId(null);
    },
    onError: () => toast.error("Failed to delete topic"),
  });

  const config = levelBadgeConfig[levelName || "Foundational"] ?? levelBadgeConfig.Foundational;
  const hoverTextClasses: Record<string, string> = {
    Foundational: "group-hover:text-[#5A6572]",
    Associate: "group-hover:text-[#0972D3]",
    Professional: "group-hover:text-[#00627A]",
    Specialty: "group-hover:text-[#5A30A6]",
  };
  const hoverClass = hoverTextClasses[levelName || "Foundational"] ?? hoverTextClasses.Foundational;

  return (
    <>
      <div className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        {/* Domain Card Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 border border-orange-200/70 text-xs font-black text-[#FF9900]">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className={cn("text-sm sm:text-base font-bold text-slate-900 leading-snug transition-colors m-0 line-clamp-2 sm:line-clamp-1", hoverClass)}>
                {domain.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400 font-medium m-0">
                Domain Weightage: <span className="font-bold text-slate-700">{domain.weightage}%</span>
              </p>
            </div>
          </div>

          {/* Action Buttons (Ghost icons without harsh boxes) */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn("text-[9.5px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase", config.badgeClass)}>
              {domain.weightage}%
            </span>
            <button
              type="button"
              className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
              onClick={() => setEditDomainOpen(true)}
              title="Edit Domain"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
              onClick={() => setDeleteDomainConfirm(true)}
              title="Delete Domain"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Weightage Progress Bar */}
        <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              width: `${domain.weightage}%`,
              backgroundColor: config.color 
            }}
          />
        </div>

        {/* Separator & Topics */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <p className="mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Syllabus Topics
          </p>

          {domain.topics.length === 0 ? (
            <p className="text-xs text-slate-400 py-1 font-medium">
              No topics yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-1 p-0 m-0 list-none">
              {[...domain.topics]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((topic) => (
                  <li
                    key={topic.id}
                    className="group/topic flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-start sm:items-center gap-2 text-slate-700 font-semibold min-w-0">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5 sm:mt-0" />
                      <span className="text-slate-400 text-xs font-bold shrink-0">{topic.displayOrder}.</span>
                      <span className="leading-snug text-slate-800">{topic.name}</span>
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                        onClick={() =>
                          setEditTopic({
                            id: topic.id,
                            domainId: domain.id,
                            name: topic.name,
                            displayOrder: topic.displayOrder,
                            createdAt: "",
                            updatedAt: "",
                          })
                        }
                        title="Edit Topic"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                        onClick={() => setDeleteTopicId(topic.id)}
                        title="Delete Topic"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}

          <button
            type="button"
            className="mt-3 w-full bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-200 hover:border-slate-300 text-slate-600 font-bold transition-all cursor-pointer h-8 rounded-lg text-xs flex items-center justify-center gap-1.5"
            onClick={() => setAddTopicOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 text-slate-400" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Edit Domain Dialog */}
      <DomainFormDialog
        open={editDomainOpen}
        onOpenChange={setEditDomainOpen}
        onSubmit={(data) => updateDomainMutation.mutate(data)}
        initialData={{
          id: domain.id,
          certificationId,
          name: domain.name,
          weightage: domain.weightage,
          displayOrder: domain.displayOrder,
          createdAt: "",
          updatedAt: "",
        }}
        isLoading={updateDomainMutation.isPending}
      />

      {/* Add Topic Dialog */}
      <TopicFormDialog
        open={addTopicOpen}
        onOpenChange={setAddTopicOpen}
        onSubmit={(data) => createTopicMutation.mutate(data)}
        isLoading={createTopicMutation.isPending}
      />

      {/* Edit Topic Dialog */}
      <TopicFormDialog
        open={!!editTopic}
        onOpenChange={(open) => !open && setEditTopic(null)}
        onSubmit={(data) => updateTopicMutation.mutate(data)}
        initialData={editTopic ?? undefined}
        isLoading={updateTopicMutation.isPending}
      />

      {/* Delete Domain Confirmation */}
      <AlertDialog
        open={deleteDomainConfirm}
        onOpenChange={setDeleteDomainConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{domain.name}&rdquo; and all
              its topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDomainMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Topic Confirmation */}
      <AlertDialog
        open={!!deleteTopicId}
        onOpenChange={(open) => !open && setDeleteTopicId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTopicId && deleteTopicMutation.mutate(deleteTopicId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
