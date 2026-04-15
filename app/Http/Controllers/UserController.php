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
            'phone' => 'nullable|string|max:15|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|max:50',
            'status' => 'required|string|max:50',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'],
                'role' => $validatedData['role'],
                'status' => $validatedData['status'],
                'password' => Hash::make($validatedData['password']),
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
