#!/usr/bin/env fish

# Script to compare local git repo with remote server
# Created: May 17, 2025
# Copyright (c) 2025 Napol Thanarangkaun (lopanapol@gmail.com)
# Licensed under Sentium License - See LICENSE file for details

# Define colors for better readability (copied from run.fish)
set GREEN (set_color green)
set BLUE (set_color blue)
set YELLOW (set_color yellow)
set RED (set_color red)
set PINK (set_color ff5fd7) # Bright pink
set ORANGE (set_color ff8c00) # Dark orange
set PURPLE (set_color 8a2be2) # Blue violet
set CYAN (set_color 00ffff) # Cyan
set NC (set_color normal)

set LOCAL_REPO_PATH (pwd)
set REMOTE_SERVER "root@sentium.run"
set REMOTE_PATH "/opt/sentium"

# Print header with nice styling
echo
echo "$PINK━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$PINK  REPOSITORY COMPARISON   $NC" 
echo "$PINK━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo "$CYAN  Local:  $LOCAL_REPO_PATH $NC"
echo "$CYAN  Remote: $REMOTE_SERVER:$REMOTE_PATH $NC"
echo

# Get local git info
echo
echo "$PURPLE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$PURPLE  LOCAL GIT INFORMATION   $NC"
echo "$PURPLE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo
git log -1 --pretty=format:"$GREEN Last commit: %h - %s (%ar) by %an $NC"
echo
echo
git status --porcelain | wc -l | read -l local_changes
echo "$BLUE Uncommitted changes: $local_changes $NC"
echo
git branch --show-current | read -l current_branch
echo "$BLUE Current branch: $current_branch $NC"
echo

# Get remote git info
echo
echo "$CYAN━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$CYAN  REMOTE GIT INFORMATION   $NC"
echo "$CYAN━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo
set remote_commit (ssh $REMOTE_SERVER "cd $REMOTE_PATH && git log -1 --pretty=format:\"%h - %s (%ar) by %an\"")
echo "$GREEN Last commit: $remote_commit $NC"
echo
ssh $REMOTE_SERVER "cd $REMOTE_PATH && git status --porcelain | wc -l" | read -l remote_changes
echo "$BLUE Uncommitted changes: $remote_changes $NC"
echo
ssh $REMOTE_SERVER "cd $REMOTE_PATH && git branch --show-current" | read -l remote_branch
echo "$BLUE Current branch: $remote_branch $NC"
echo

# Compare head commits
echo
echo "$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$GREEN  COMPARING HEAD COMMITS   $NC"
echo "$GREEN━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo
git rev-parse HEAD | read -l local_head
ssh $REMOTE_SERVER "cd $REMOTE_PATH && git rev-parse HEAD" | read -l remote_head

if test "$local_head" = "$remote_head"
    echo "$GREEN HEAD commits match: $local_head $NC"
else
    echo "$YELLOW HEAD commits differ: $NC"
    echo "$BLUE Local:  $local_head $NC"
    echo "$BLUE Remote: $remote_head $NC"
    
    # Get commit difference count
    echo
    echo "$ORANGE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo "$ORANGE  COMMIT DIFFERENCES    $NC"
    echo "$ORANGE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo
    echo
    git rev-list --count "$remote_head..$local_head" 2>/dev/null | read -l ahead_count
    git rev-list --count "$local_head..$remote_head" 2>/dev/null | read -l behind_count
    
    if test "$behind_count" -gt 0
        echo "$YELLOW Remote is $behind_count commit(s) ahead of local $NC"
    end
    if test "$ahead_count" -gt 0
        echo "$GREEN Local is $ahead_count commit(s) ahead of remote $NC"
    end
    
    # Show some of the different commits
    echo
    echo "$RED━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo "$RED  UNIQUE COMMITS ON REMOTE   $NC"
    echo "$RED━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo
    set remote_unique (ssh $REMOTE_SERVER "cd $REMOTE_PATH && git log --pretty=format:\"%h: %s\" -n 3 $local_head..$remote_head" 2>/dev/null | string replace -a "\n" "\n\n")
    if test -n "$remote_unique"
        echo "$ORANGE$remote_unique$NC"
    else
        echo "$BLUE None $NC"
    end
    
    echo
    echo "$YELLOW━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo "$YELLOW  UNIQUE COMMITS ON LOCAL   $NC"
    echo "$YELLOW━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
    echo
    set local_unique (git log --pretty=format:"%h: %s" -n 3 $remote_head..$local_head 2>/dev/null | string replace -a "\n" "\n\n")
    if test -n "$local_unique"
        echo "$GREEN$local_unique$NC"
    else
        echo "$BLUE None $NC"
    end
end

# Check for specific files related to Python 3.13 compatibility
echo
echo "$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$BLUE  PYTHON 3.13 COMPATIBILITY   $NC"
echo "$BLUE━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo "$BLUE Local: $NC"
echo
test -f "tools/fast-ai-install-py13.fish" && echo "$GREEN ✓ tools/fast-ai-install-py13.fish exists $NC" || echo "$RED ✗ tools/fast-ai-install-py13.fish missing $NC"
test -f "system/ai-model/service-py13.fish" && echo "$GREEN ✓ system/ai-model/service-py13.fish exists $NC" || echo "$RED ✗ system/ai-model/service-py13.fish missing $NC"
echo

echo "$BLUE Remote: $NC"
echo
ssh $REMOTE_SERVER "test -f $REMOTE_PATH/tools/fast-ai-install-py13.fish" && echo "$GREEN ✓ tools/fast-ai-install-py13.fish exists $NC" || echo "$RED ✗ tools/fast-ai-install-py13.fish missing $NC"
ssh $REMOTE_SERVER "test -f $REMOTE_PATH/system/ai-model/service-py13.fish" && echo "$GREEN ✓ system/ai-model/service-py13.fish exists $NC" || echo "$RED ✗ system/ai-model/service-py13.fish missing $NC"

# Check if run.fish is the only file in root directory on remote server
echo
echo
echo "$MAGENTA━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$MAGENTA  REMOTE FILE STRUCTURE     $NC"
echo "$MAGENTA━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
echo
ssh $REMOTE_SERVER "find $REMOTE_PATH -maxdepth 1 -type f | grep -v 'run.fish' | wc -l" | read -l non_run_files
if test "$non_run_files" -gt 0
    echo "$RED Warning: Found $non_run_files files other than run.fish in root directory on remote server $NC"
    echo "$YELLOW Files in root directory on remote server: $NC"
    set remote_files (ssh $REMOTE_SERVER "find $REMOTE_PATH -maxdepth 1 -type f -not -name 'run.fish' | sort")
    for file in $remote_files
        echo "$BLUE $file $NC"
    end
    
    echo
    echo "$YELLOW These files should be moved to appropriate subdirectories. $NC"
    echo "$GREEN You can move them with commands like: $NC"
    echo "$CYAN ssh $REMOTE_SERVER \"mkdir -p $REMOTE_PATH/tools && mv $REMOTE_PATH/FILENAME $REMOTE_PATH/tools/\" $NC"
else
    echo "$GREEN ✓ Only run.fish exists in root directory on remote server $NC"
end

echo
echo "$PINK━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo "$PINK  COMPARISON COMPLETE      $NC"
echo "$PINK━━━━━━━━━━━━━━━━━━━━━━━━━━$NC"
echo
