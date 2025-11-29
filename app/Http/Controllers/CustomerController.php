<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%")
                  ->orWhere('primary_phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', ucfirst($request->status));
        }

        // Filter by service package
        if ($request->has('package')) {
            $query->where('service_package', $request->package);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $customers = $query->paginate($perPage);

        return Inertia::render('customers/customers', [
            'success' => true,
            'data' => $customers,
            'stats' => [
                'total' => Customer::count(),
                // 'active' => Customer::active()->count(),
                // 'suspended' => Customer::suspended()->count(),
                // 'inactive' => Customer::inactive()->count(),
            ]
        ]);

    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'account_number' => 'required|string|unique:customers,account_number|max:50',
            'primary_phone' => 'required|string|max:20',
            'email_address' => 'nullable|email|max:255',
            'physical_address' => 'nullable|string',
            'service_package' => 'required',
            'status' => 'required',
            'installation_date' => 'required',
        ]);

        // dd($request->installation_date);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customer = Customer::create($request->all());

            return Inertia::render('customers/customers', [
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $customer
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $customer = Customer::with('tickets')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        return Inertia::render('customers/CustomerDetails', [
            'success' => true,
            'data' => $customer
        ]);
    }


    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'sometimes|required|string|max:255',
            'primary_phone' => 'sometimes|required|string|max:20',
            'email_address' => 'sometimes|nullable|email|max:255',
            'physical_address' => 'sometimes|nullable|string',
            'service_package' => 'sometimes|required|in:Basic 20Mbps,Standard 50Mbps,Premium 100Mbps,Business 200Mbps',
            'status' => 'sometimes|required|in:Active,Suspended,Inactive',
            'installation_date' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customer->update($request->all());

            return Inertia::render('customers/CustomerDetails', [
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function generateAccountNumber(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'account_number' => Customer::generateAccountNumber()
        ]);
    }



}
