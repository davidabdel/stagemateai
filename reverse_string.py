def reverse_string(s):
    """
    Reverse a string and return the result.
    
    Args:
        s (str): The string to reverse
        
    Returns:
        str: The reversed string
    """
    return s[::-1]


# Example usage
if __name__ == "__main__":
    test_string = "Hello, World!"
    reversed_string = reverse_string(test_string)
    print(f"Original: {test_string}")
    print(f"Reversed: {reversed_string}")