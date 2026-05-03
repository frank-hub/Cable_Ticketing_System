<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InternetPackages;
use Inertia\Inertia;
class InternetPackagesController extends Controller
{
       /**
     * GET /packages
     */
    public function index()
    {
        $packages = InternetPackages::orderBy('type')
            ->orderBy('speed')
            ->get()
            ->map(fn($pkg) => [
                'id'          => $pkg->id,
                'name'        => $pkg->name,
                'speed'       => $pkg->speed,
                'speed_label' => $pkg->formatted_speed,
                'price'       => $pkg->price,
                'price_label' => $pkg->formatted_price,
                'type'        => $pkg->type,
                'description' => $pkg->description,
                'is_active'   => $pkg->is_active,
                'created_at'  => $pkg->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('packages/index', [
            'packages' => $packages,
            'stats'    => [
                'total'    => InternetPackages::count(),
                'active'   => InternetPackages::active()->count(),
                'home'     => InternetPackages::home()->count(),
                'business' => InternetPackages::business()->count(),
            ],
        ]);
    }

    /**
     * POST /packages
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'speed'       => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'type'        => 'required|in:Home,Business',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        InternetPackages::create($validated);

        return redirect()->back()->with('success', 'Package created successfully.');
    }

    /**
     * PATCH /packages/{package}
     */
    public function update(Request $request, InternetPackages $package)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'speed'       => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'type'        => 'required|in:Home,Business',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $package->update($validated);

        return redirect()->back()->with('success', 'Package updated successfully.');
    }

    /**
     * PATCH /packages/{package}/toggle
     * Quick enable/disable without opening edit modal.
     */
    public function toggle(InternetPackages $package)
    {
        $package->update(['is_active' => !$package->is_active]);

        $state = $package->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Package {$state} successfully.");
    }

    /**
     * DELETE /packages/{package}
     * Soft delete — package is hidden but data is preserved.
     */
    public function destroy(InternetPackages $package)
    {
        $package->delete();

        return redirect()->back()->with('success', 'Package deleted successfully.');
    }
}
