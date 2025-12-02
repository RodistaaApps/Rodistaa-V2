# Workspace Cleanup Plan

**Date**: December 2, 2025  
**Purpose**: Consolidate project to single location and remove obsolete files

---

## Current Situation

### ✅ Active Project Location
**Path**: `C:\Users\devel\Desktop\Rodistaa`
- Latest React Native mobile apps (Expo)
- Next.js portals (Admin + Franchise)
- Fastify backend
- ACS service
- All latest documentation
- **THIS IS THE CORRECT, ACTIVE PROJECT**

### ❌ Obsolete Location
**Path**: `C:\Users\devel\Documents\Rodistaa\New_UserUI_App`
- Old Flutter/Dart mobile apps
- Obsolete documentation
- Old tech stack
- **TO BE DELETED**

---

## Files to Delete (Old Path)

The entire `C:\Users\devel\Documents\Rodistaa\New_UserUI_App` directory will be removed, including:

### Flutter/Dart Apps (Obsolete)
- `rodistaa_apps/` - Old Flutter apps
- `apps/` - More Flutter code
- `mobile/` - Old mobile implementations
- `*.dart` files

### Old Portals (Replaced)
- `admin-portal/` - Replaced by `packages/portal/`
- `franchise-portal/` - Replaced by `packages/portal/`

### Old Backend (Replaced)
- `backend/` - Old implementation
- `services/` - Old service structure

### Obsolete Documentation (100+ MD files)
All the old status/completion reports that are no longer relevant.

---

## Verification Before Deletion

### Confirm Active Project Has:
✅ React Native apps in `packages/mobile/`
- operator
- driver  
- shipper

✅ Next.js portals in `packages/portal/`
- Admin portal pages
- Franchise portal pages

✅ Backend in `packages/backend/`
- Fastify implementation

✅ ACS in `packages/acs/` and `docs/acs-service/`

✅ All latest commits in git history

---

## Cleanup Actions

### Action 1: Backup (Safety)
Create a compressed archive of old directory before deletion:
```powershell
Compress-Archive -Path "C:\Users\devel\Documents\Rodistaa\New_UserUI_App" -DestinationPath "C:\Users\devel\Documents\Rodistaa\New_UserUI_App_BACKUP_20251202.zip"
```

### Action 2: Delete Old Directory
```powershell
Remove-Item -Path "C:\Users\devel\Documents\Rodistaa\New_UserUI_App" -Recurse -Force
```

### Action 3: Update VSCode Workspace
Remove old workspace folder from workspace settings.

### Action 4: Update Memory
Update agent memory to reference only the correct path.

---

## Post-Cleanup Verification

After cleanup, verify:
1. ✅ `C:\Users\devel\Desktop\Rodistaa` exists and has all files
2. ✅ All packages build successfully
3. ✅ Git repository intact with full history
4. ✅ No references to old path in code
5. ✅ VSCode workspace clean

---

## Disk Space Recovery

Expected space recovered: ~500MB - 2GB (depending on node_modules)

---

## Safety Notes

- ✅ Old directory will be backed up as ZIP before deletion
- ✅ Active project in `Desktop\Rodistaa` is untouched
- ✅ All git history preserved
- ✅ Can restore from backup if needed

---

**Status**: Ready for execution  
**Risk Level**: LOW (backup created first)  
**Approval Required**: Yes (user confirmation)

