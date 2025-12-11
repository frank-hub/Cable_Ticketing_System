<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('role', '!=', 'superadmin')->get();

        // dd($users);

        return Inertia::render('admin_settings/users', ['users' => $users]);
    }

    public function storeUser(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|max:50',
            'status' => 'required|string|max:50',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // dd($validatedData);

        try {
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'role' => $validatedData['role'],
                'status' => $validatedData['status'],
                'password' => Hash::make($validatedData['password']),
            ]);
            // mail($user->email, 'Welcome to Cable Ticketing System', 'Your account has been created.');
            return redirect()->back()->with('success', 'User created successfully.');

        } catch (ValidationException $e) {
            return redirect()->back();
        }

    }
}
