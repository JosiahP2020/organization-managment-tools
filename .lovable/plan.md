
# Plan: Rebuild Sidebar Menu Navigation

## Overview
Create a new sidebar menu component that slides in from the left side of the screen, featuring the organization's sub-logo, user profile information, navigation links, and sign-out functionality. The sidebar will be triggered by a Menu button in the header.

## Visual Structure

```text
+------------------------------------------+
| [Sub-Logo]        [Avatar] Name     [X]  |
|                           Role Badge     |
+------------------------------------------+
|                                          |
|  MENUS                                   |
|  ────────────────────────────────────    |
|  🏠 Dashboard                            |
|                                          |
|  ADMIN                                   |
|  ────────────────────────────────────    |
|  👥 User Management                      |
|  🏢 Organization Settings                |
|                                          |
|                                          |
|                                          |
|                                          |
+------------------------------------------+
|  ↪ Sign Out                              |
+------------------------------------------+
```

## Key Features
1. **Top Section**: Sub-logo on the left, user avatar + name + role badge on the right, X close button
2. **Menus Section**: Gray "MENUS" label with Dashboard navigation button below
3. **Admin Section**: Gray "ADMIN" label with User Management and Organization Settings (admin-only)
4. **Bottom Section**: Sign Out button pinned to bottom
5. **User Profile**: Clickable to navigate to Settings page

## Technical Details

### New Components to Create

**1. `src/components/SidebarMenu.tsx`**
A new Sheet-based sidebar component with:
- Uses Radix UI Sheet component (slides from left)
- Receives `open` and `onOpenChange` props for controlled state
- Structure:
  - Header row with sub-logo, user profile (avatar, name, badge), and close button
  - Scrollable content area with navigation sections
  - Footer with Sign Out button

**2. Menu Trigger Button**
Add a Menu button to `DashboardHeader.tsx` that opens the sidebar

### Files to Modify

**1. `src/components/DashboardHeader.tsx`**
- Add Menu button (hamburger icon) on the left side of the header
- Import and render the new SidebarMenu component
- Manage open/close state for the sidebar

**2. `src/components/SidebarMenu.tsx` (new file)**
- Import required dependencies:
  - Sheet components from `@/components/ui/sheet`
  - Avatar components from `@/components/ui/avatar`
  - Badge from `@/components/ui/badge`
  - Separator from `@/components/ui/separator`
  - Icons: `Menu`, `X`, `LayoutDashboard`, `Users`, `Building2`, `LogOut`
  - `useAuth` hook for user/profile/organization/role data
  - `useThemeLogos` hook for sub-logo URL
  - `useNavigate` from react-router-dom
  - `Logo` component for rendering sub-logo

### Component Structure

```tsx
// SidebarMenu.tsx structure
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="left" className="w-80 p-0 flex flex-col">
    {/* Header - Logo + User Profile */}
    <div className="flex items-center justify-between p-4 border-b">
      {/* Sub-logo on left */}
      <Logo customSrc={subLogoUrl} variant="icon" size="md" />
      
      {/* User profile - clickable to settings */}
      <button onClick={() => navigate('/settings')} className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile?.full_name}</p>
          <Badge variant="secondary">{role}</Badge>
        </div>
      </button>
    </div>
    
    {/* Scrollable Navigation */}
    <div className="flex-1 overflow-y-auto p-4">
      {/* MENUS Section */}
      <p className="text-xs text-muted-foreground mb-2">MENUS</p>
      <Separator className="mb-3" />
      <NavLink to={`/dashboard/${org.slug}`}>
        <LayoutDashboard /> Dashboard
      </NavLink>
      
      {/* ADMIN Section - only for admins */}
      {isAdmin && (
        <>
          <p className="text-xs text-muted-foreground mt-6 mb-2">ADMIN</p>
          <Separator className="mb-3" />
          <NavLink to="/admin/users">
            <Users /> User Management
          </NavLink>
          <NavLink to="/admin/organization">
            <Building2 /> Organization Settings
          </NavLink>
        </>
      )}
    </div>
    
    {/* Footer - Sign Out */}
    <div className="border-t p-4">
      <button onClick={handleSignOut}>
        <LogOut /> Sign Out
      </button>
    </div>
  </SheetContent>
</Sheet>
```

### Styling Considerations
- Sidebar background uses `bg-sidebar-background` from CSS variables
- Text uses `text-sidebar-foreground`
- Active nav items highlighted with `bg-sidebar-accent`
- Muted section labels use `text-muted-foreground`
- Sign Out button styled with destructive/red color
- User profile area has subtle hover state
- Touch-friendly targets (min 44x44px)
- Responsive for both mobile and desktop

### Navigation Behavior
- Dashboard link: `/dashboard/{org.slug}`
- User Management link: `/admin/users`
- Organization Settings link: `/admin/organization`
- User profile click: `/settings`
- Sign Out: Calls `signOut()` and redirects to `/`
- All navigation closes the sidebar automatically

## Implementation Steps

1. Create `src/components/SidebarMenu.tsx` with the full sidebar layout
2. Update `src/components/DashboardHeader.tsx` to:
   - Add state for sidebar open/close
   - Add Menu button on the left side
   - Render the SidebarMenu component
3. Ensure dark/light theme compatibility
4. Test navigation and sign-out flows
